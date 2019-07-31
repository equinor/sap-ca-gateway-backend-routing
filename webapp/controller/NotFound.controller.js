sap.ui.define([
		"com/equinor/sap/cross/sap-ca-gateway-backend-routing/controller/BaseController"
	], function (BaseController) {
		"use strict";

		return BaseController.extend("com.equinor.sap.cross.sap-ca-gateway-backend-routing.controller.NotFound", {

			/**
			 * Navigates to the worklist when the link is pressed
			 * @public
			 */
			onLinkPressed : function () {
				this.getRouter().navTo("worklist");
			}

		});

	}
);