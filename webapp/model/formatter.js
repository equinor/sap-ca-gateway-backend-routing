sap.ui.define([], function () {
	"use strict";

	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 */
		numberUnit: function (sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		/**
		 * When escaped replaces escape code for slash in string with slash symbol and returns string  
		 * @public
		 * @param {string} sValue the string to check for escaped code for slash with slash symbol
		 * @returns {string} sValue the string with eventually slash symbol otherwis unchanged
		 */		 
		decodeSlashEncoding: function (sValue) {
			if (sValue === undefined || sValue === null || sValue === "") {
				return sValue;
			} else {
				var replacedString = sValue.replace(/%2F/g, "/");
				return replacedString;
			}
		}
	};

});