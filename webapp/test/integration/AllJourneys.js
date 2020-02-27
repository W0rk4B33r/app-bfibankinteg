sap.ui.define([
	"sap/ui/test/Opa5",
	"com/apptech/app-bankinteg/test/integration/arrangements/Startup",
	"com/apptech/app-bankinteg/test/integration/BasicJourney"
], function(Opa5, Startup) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new Startup(),
		pollingInterval: 1
	});

});
