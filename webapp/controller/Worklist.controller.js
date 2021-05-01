/*global location history */
sap.ui.define(
  [
    "nl/peppieportals/zakenpartner/controller/BaseController",
    "nl/peppieportals/zakenpartner/model/formatter",
    "nl/peppieportals/zakenpartner/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "nl/peppieportals/library/utils/toolbox",
  ],
  function (BaseController, formatter, models, JSONModel, History, Filter, FilterOperator, toolbox) {
    "use strict";

    return BaseController.extend("nl.peppieportals.zakenpartner.controller.Worklist", {
      formatter: formatter,

      /* =========================================================== */
      /* lifecycle methods                                           */
      /* =========================================================== */

      /**
       * Called when the worklist controller is instantiated.
       * @public
       */
      onInit: function () {
        var oViewModel,
          iOriginalBusyDelay,
          oTable = this.byId("table");

        // Put down worklist table's original value for busy indicator delay,
        // so it can be restored later on. Busy handling on the table is
        // taken care of by the table itself.
        iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
        // keeps the search state
        this._aTableSearchState = [];

        // Model used to manipulate control states
        oViewModel = new JSONModel({
          worklistTableTitle: this.getResourceBundle().getText("worklistTableTitle"),
          saveAsTileTitle: this.getResourceBundle().getText(
            "saveAsTileTitle",
            this.getResourceBundle().getText("worklistViewTitle")
          ),
          shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
          shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
          shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
          tableNoDataText: this.getResourceBundle().getText("tableNoDataText"),
          tableBusyDelay: 0,
        });
        this.setModel(oViewModel, "worklistView");
      },

      /* =========================================================== */
      /* event handlers                                              */
      /* =========================================================== */

      /**
       * Triggered by the table's 'updateFinished' event: after new table
       * data is available, this handler method updates the table counter.
       * This should only happen if the update was successful, which is
       * why this handler is attached to 'updateFinished' and not to the
       * table's list binding's 'dataReceived' method.
       * @param {sap.ui.base.Event} oEvent the update finished event
       * @public
       */
      onUpdateFinished: function (oEvent) {},

      onPressCreateZakenpartnerBedrijf: function () {
        this.getRouter().navTo("aanmaken", {
          objectId: "2",
        });
      },

      onPressCreateZakenpartnerPersoon: function () {
        this.getRouter().navTo("aanmaken", {
          objectId: "1",
        });
      },

      /**
       * Event handler when a table item gets pressed
       * @param {sap.ui.base.Event} oEvent the table selectionChange event
       * @public
       */
      onPress: function (oEvent) {
        // The source is the list item that got pressed
        this._showObject(oEvent.getSource());
      },

      /**
       * Event handler when the share in JAM button has been clicked
       * @public
       */
      onShareInJamPress: function () {
        var oViewModel = this.getModel("worklistView"),
          oShareDialog = sap.ui.getCore().createComponent({
            name: "sap.collaboration.components.fiori.sharing.dialog",
            settings: {
              object: {
                id: location.href,
                share: oViewModel.getProperty("/shareOnJamTitle"),
              },
            },
          });
        oShareDialog.open();
      },

      onSearch: function (oEvent) {
        if (oEvent.getParameters().refreshButtonPressed) {
          // Search field's 'refresh' button has been pressed.
          // This is visible if you select any master list item.
          // In this case no new search is triggered, we only
          // refresh the list binding.
          this.onRefresh();
        } else {
          var aFilters = [];
          var sQuery = oEvent.getParameter("query");

          if (sQuery && sQuery.length > 0) {
            aFilters = [new Filter("Zoekargument", FilterOperator.Contains, sQuery)];
          }
          this._applySearch(aFilters);
        }
      },

      /**
       * Event handler for refresh event. Keeps filter, sort
       * and group settings and refreshes the list binding.
       * @public
       */
      onRefresh: function () {
        var oTable = this.byId("table");
        oTable.getBinding("items").refresh();
      },

      /* =========================================================== */
      /* internal methods                                            */
      /* =========================================================== */

      /**
       * Shows the selected item on the object page
       * On phones a additional history entry is created
       * @param {sap.m.ObjectListItem} oItem selected Item
       * @private
       */
      _showObject: function (oItem) {
        var oObj = oItem.getBindingContext().getObject();

        this.getRouter().navTo("tonen", {
          objectId: oObj.Partner,
        });
      },

      /**
       * Internal helper method to apply both filter and search state together on the list binding
       * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
       * @private
       */
      _applySearch: function (aTableSearchState) {
        var oTable = this.byId("table"),
          oViewModel = this.getModel("worklistView");
        oTable.getBinding("items").filter(aTableSearchState, "Application");
        // changes the noDataText of the list in case there are no filter results
        if (aTableSearchState.length !== 0) {
          oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
        }
      },

      onMessagesButtonPress: function (oEvent) {
        var oMessagesButton = oEvent.getSource();
        toolbox.displayPopoverMessage(this, oMessagesButton);
      },
    });
  }
);
