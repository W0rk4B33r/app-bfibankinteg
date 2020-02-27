sap.ui.define([
	"sap/ui/test/Opa5"
], function(Opa5) {
	"use strict";

	return Opa5.extend("com.apptech.app-bankinteg.test.integration.arrangements.Startup", {

		iStartMyApp: function () {
			this.iStartMyUIComponent({
				componentConfig: {
					name: "com.apptech.app-bankinteg",
					async: true,
					manifest: true
				}
			});
		}

	});
});
