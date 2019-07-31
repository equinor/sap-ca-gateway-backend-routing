/*global location*/
sap.ui.define([
	"com/equinor/sap/cross/sap-ca-gateway-backend-routing/controller/BaseController",
	"sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",	
	"sap/ui/core/routing/History",
	"com/equinor/sap/cross/sap-ca-gateway-backend-routing/model/formatter"
], function (
	BaseController,
	JSONModel,
	MessageToast,
	History,
	formatter
) {
	"use strict";

	return BaseController.extend("com.equinor.sap.cross.sap-ca-gateway-backend-routing.controller.Object", {

		formatter: formatter,

		/* =========================================================== */
		/* lifecycle methods                                           */
		/* =========================================================== */

		/**
		 * Called when the worklist controller is instantiated.
		 * @public
		 */
		onInit: function () {
			// Model used to manipulate control states. The chosen values make sure,
			// detail page is busy indication immediately so there is no break in
			// between the busy indication for loading the view's meta data
			var iOriginalBusyDelay,
				oViewModel = new JSONModel({
					busy: true,
					delay: 0
				});

			this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

			// Store original busy indicator delay, so it can be restored later on
			iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
			this.setModel(oViewModel, "objectView");
			this.getOwnerComponent().getModel().metadataLoaded().then(function () {
				// Restore original busy indicator delay for the object view
				oViewModel.setProperty("/delay", iOriginalBusyDelay);
			});
		},

		/* =========================================================== */
		/* event handlers                                              */
		/* =========================================================== */

		/**
		 * Event handler  for navigating back.
		 * It there is a history entry we go one step back in the browser history
		 * If not, it will replace the current entry of the browser history with the worklist route.
		 * @public
		 */
		onNavBack: function () {
			var sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("worklist", {}, true);
			}
		},

		/* =========================================================== */
		/* internal methods                                            */
		/* =========================================================== */

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
		 * @private
		 */
		_onObjectMatched: function (oEvent) {
			var sObjectId = oEvent.getParameter("arguments").objectId;
			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("ServiceSet", {
					SrvIdentifier: sObjectId
				});
				this._bindView("/" + sObjectPath);
			}.bind(this));
		},

		/**
		 * Binds the view to the object path.
		 * @function
		 * @param {string} sObjectPath path to the object to be bound
		 * @private
		 */
		_bindView: function (sObjectPath) {
			var oViewModel = this.getModel("objectView"),
				oDataModel = this.getModel();

			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataRequested: function () {
						oDataModel.metadataLoaded().then(function () {
							// Busy indicator on view should only be set if metadata is loaded,
							// otherwise there may be two busy indications next to each other on the
							// screen. This happens because route matched handler already calls '_bindView'
							// while metadata is loaded.
							oViewModel.setProperty("/busy", true);
						});
					},
					dataReceived: function () {
						oViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		_onBindingChange: function () {
			var oView = this.getView(),
				oViewModel = this.getModel("objectView"),
				oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			var oResourceBundle = this.getResourceBundle(),
				oObject = oView.getBindingContext().getObject(),
				sObjectId = oObject.SrvIdentifier,
				sObjectName = oObject.ServiceName;

			oViewModel.setProperty("/busy", false);

			oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
			oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
		},

		/**
		 * Overrule or reset the backend system routing for a given OData service.
		 */
		overruleODataRouting: function (oEvent) {

			var systemAliasWhenSuccess = oEvent.getSource().getBindingContext().getProperty('SystemAlias');
			/*var actionTextForSystemAliasWhenSuccess;*/

/*			if (oEvent.getSource().getBindingContext().getProperty('IsDefault')) {
				actionTextForSystemAliasWhenSuccess = 'removed for';
				this.getOwnerComponent().getModel("globalVariables").setProperty("/isOverruledThisService", false);
			} else {
				actionTextForSystemAliasWhenSuccess = 'set to';
				this.getOwnerComponent().getModel("globalVariables").setProperty("/isOverruledThisService", true);
			}*/

			var oModel = this.getView().getModel();
			oModel.callFunction("/OverRuleRouting", {
				method: "POST",
				urlParameters: {
					"ServiceId": oEvent.getSource().getBindingContext().getProperty('ServiceId'),
					"SystemAlias": oEvent.getSource().getBindingContext().getProperty('SystemAlias')
				},
				success: function () {
					MessageToast.show("Routing set to " + systemAliasWhenSuccess);
					oModel.refresh(true, true, '');
				},
				error: function () {
					MessageToast.show("Something went wrong !");
				}
			});
		}

	});

});