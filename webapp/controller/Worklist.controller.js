/*global location history */
sap.ui.define(
  [
    "nl/peppieportals/overzichttijdgegevens/controller/BaseController",
    "nl/peppieportals/overzichttijdgegevens/model/formatter",
    "nl/peppieportals/overzichttijdgegevens/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
  ],
  function(
    BaseController,
    formatter,
    models,
    JSONModel,
    History,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return BaseController.extend(
      "nl.peppieportals.overzichttijdgegevens.controller.Worklist",
      {
        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function() {
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
            worklistTableTitle: this.getResourceBundle().getText(
              "worklistTableTitle"
            ),
            saveAsTileTitle: this.getResourceBundle().getText(
              "saveAsTileTitle",
              this.getResourceBundle().getText("worklistViewTitle")
            ),
            shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
            shareSendEmailSubject: this.getResourceBundle().getText(
              "shareSendEmailWorklistSubject"
            ),
            shareSendEmailMessage: this.getResourceBundle().getText(
              "shareSendEmailWorklistMessage",
              [location.href]
            ),
            tableNoDataText: this.getResourceBundle().getText(
              "tableNoDataText"
            ),
            tableBusyDelay: 0
          });
          this.setModel(oViewModel, "worklistView");

          // Make sure, busy indication is showing immediately so there is no
          // break after the busy indication for loading the view's meta data is
          // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
          oTable.attachEventOnce("updateFinished", function() {
            // Restore original busy indicator delay for worklist's table
            oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
          });
          // Add the worklist page to the flp routing history
          this.addHistoryEntry(
            {
              title: this.getResourceBundle().getText("worklistViewTitle"),
              icon: "sap-icon://table-view",
              intent: "#Overzichttijdgegevens-display"
            },
            true
          );
        },

        onAfterRendering: function() {
          var oModel = this.getView().getModel("helper");
          var oTable = this.byId("table");
          var that = this;

          // models
          // 	.getEmployeeDetailData()
          // 	.then(function(oData) {
          // 		console.log('Employee Data', oData);
          // 		oModel.setProperty('/store/userdata', oData);
          // 		return models.getTimeData(that._getFilterOptions(oModel));
          // 	})
          // 	.then(function(oTimeData) {
          // 		console.log('oTimeData', oTimeData);
          // 		oModel.setProperty('/store/timedata', oTimeData);
          // 		oModel.setProperty('/ui/busy', false);
          // 	});
          models.getEmployeeDetailData().then(function(oData) {
            console.log("Employee Data", oData);
            oModel.setProperty("/store/userdata", oData);
            oModel.setProperty("/ui/busy", false);
          });
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        onSelectRadio: function(oEvt) {
          this.getModel("helper").setProperty(
            "/filter/intern",
            oEvt.getSource().getText() === "Intern"
          );
          this.onFilterGetData();
        },

        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished: function(oEvent) {
          // update the worklist's object counter after the table update
          var sTitle,
            oTable = oEvent.getSource(),
            iTotalItems = oEvent.getParameter("total");

          var bIntern = this.getModel("helper").getProperty("/filter/intern");
          // only update the counter if the length is final and
          // the table is not empty
          if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
            sTitle = this.getResourceBundle().getText(
              bIntern ? "intern" : "extern",
              [iTotalItems]
            );
          } else {
            sTitle = this.getResourceBundle().getText("worklistTableTitle");
          }
          this.getModel("worklistView").setProperty(
            "/worklistTableTitle",
            sTitle
          );
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress: function(oEvent) {
          // The source is the list item that got pressed
          this._showObject(oEvent.getSource());
        },

        /**
         * Event handler when the share in JAM button has been clicked
         * @public
         */
        onShareInJamPress: function() {
          var oViewModel = this.getModel("worklistView"),
            oShareDialog = sap.ui.getCore().createComponent({
              name: "sap.collaboration.components.fiori.sharing.dialog",
              settings: {
                object: {
                  id: location.href,
                  share: oViewModel.getProperty("/shareOnJamTitle")
                }
              }
            });
          oShareDialog.open();
        },

        onSearch: function(oEvent) {
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
				aFilters = [
                new Filter({
                  filters: [
                    new Filter("Ename", FilterOperator.Contains, sQuery),
                    new Filter("Nachn", FilterOperator.Contains, sQuery),
                    new Filter("Rufnm", FilterOperator.Contains, sQuery)
                  ],
                  and: false
                })
              ];
            }
            this._applySearch(aFilters);
          }
        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function() {
          var oTable = this.byId("table");
          oTable.getBinding("items").refresh();
        },

        onFilterGetData: function(oEvt) {
          var oModel = this.getModel("helper");

          if (!oModel.getProperty("/ui/busy")) {
            oModel.setProperty("/ui/busy", true);
            oModel.setProperty("/store/timedata", null);
            models
              .getTimeData(this._getFilterOptions(oModel))
              .then(function(oData) {
                oModel.setProperty("/store/timedata", oData);
                oModel.setProperty("/ui/busy", false);
              });
          }
        },

        _getFilterOptions: function(oModel) {
          var aFilters = [];

          var sTotenMet = this.getView()
            .byId("searchTo")
            .getDateValue();
          var sJaar = sTotenMet.getFullYear();
          var bIntern = oModel.getProperty("/filter/intern");
          var sUserId = oModel.getProperty("/store/userdata/Userid");

          var aFilters = [
            new Filter({
              filters: [
                new Filter("SelUserid", FilterOperator.EQ, sUserId),
                new Filter("SelJaar", FilterOperator.EQ, sJaar),
                //							new Filter("SelPeilDatum", FilterOperator.EQ, new Date()),
                new Filter("SelDatumTot", FilterOperator.EQ, sTotenMet),
                //							new Filter("SelInclMgr", FilterOperator.EQ, false),
                new Filter(
                  "SelMdwSoort",
                  FilterOperator.EQ,
                  bIntern ? "I" : "E"
                )
              ],
              and: true
            })
          ];
          return aFilters;
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
        _showObject: function(oItem) {
          var oObj = oItem.getBindingContext("helper").getObject();
          var sBegda = oObj.Begda.toLocaleDateString().replace(/\//g, ".");
          var sEndda = oObj.Endda.toLocaleDateString().replace(/\//g, ".");

          this.getModel("helper").setProperty("/store/timedetails/current", {
            Pernr: oObj.Pernr,
            Ename: oObj.Ename,
            Begda: oObj.Begda,
            Endda: oObj.Endda
          });

          this.getRouter().navTo("object", {
            objectId: oObj.Pernr,
            begda: sBegda,
            endda: sEndda
          });
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function(aTableSearchState) {
          var oTable = this.byId("table"),
            oViewModel = this.getModel("worklistView");
          oTable.getBinding("items").filter(aTableSearchState, "Application");
          // changes the noDataText of the list in case there are no filter results
          if (aTableSearchState.length !== 0) {
            oViewModel.setProperty(
              "/tableNoDataText",
              this.getResourceBundle().getText("worklistNoDataWithSearchText")
            );
          }
        }
      }
    );
  }
);
