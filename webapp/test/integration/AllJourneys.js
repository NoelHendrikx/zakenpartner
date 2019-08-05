/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
	"sap/ui/test/Opa5",
	"nl/peppieportals/overzichttijdgegevens/test/integration/pages/Common",
	"sap/ui/test/opaQunit",
	"nl/peppieportals/overzichttijdgegevens/test/integration/pages/Worklist",
	"nl/peppieportals/overzichttijdgegevens/test/integration/pages/Object",
	"nl/peppieportals/overzichttijdgegevens/test/integration/pages/NotFound",
	"nl/peppieportals/overzichttijdgegevens/test/integration/pages/Browser",
	"nl/peppieportals/overzichttijdgegevens/test/integration/pages/App"
], function (Opa5, Common) {
	"use strict";
	Opa5.extendConfig({
		arrangements: new Common(),
		viewNamespace: "nl.peppieportals.overzichttijdgegevens.view."
	});

	sap.ui.require([
		"nl/peppieportals/overzichttijdgegevens/test/integration/WorklistJourney",
		"nl/peppieportals/overzichttijdgegevens/test/integration/ObjectJourney",
		"nl/peppieportals/overzichttijdgegevens/test/integration/NavigationJourney",
		"nl/peppieportals/overzichttijdgegevens/test/integration/NotFoundJourney",
		"nl/peppieportals/overzichttijdgegevens/test/integration/FLPIntegrationJourney"
	], function () {
		QUnit.start();
	});
});