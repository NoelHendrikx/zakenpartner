sap.ui.define(["nl/peppieportals/zakenpartner/controller/BaseController"], function (BaseController) {
  "use strict";

  return BaseController.extend("nl.peppieportals.zakenpartner.controller.NotFound", {
    /**
     * Navigates to the worklist when the link is pressed
     * @public
     */
    onLinkPressed: function () {
      this.getRouter().navTo("worklist");
    },
  });
});