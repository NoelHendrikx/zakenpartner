/*global location*/
sap.ui.define(
  [
    "nl/peppieportals/overzichttijdgegevens/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",

    "nl/peppieportals/overzichttijdgegevens/model/formatter",
    "nl/peppieportals/overzichttijdgegevens/model/models",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
  ],
  function(
    BaseController,
    JSONModel,
    History,
    formatter,
    models,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return BaseController.extend(
      "nl.peppieportals.overzichttijdgegevens.controller.Object",
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
          // Model used to manipulate control states. The chosen values make sure,
          // detail page is busy indication immediately so there is no break in
          // between the busy indication for loading the view's meta data
          var iOriginalBusyDelay,
            oViewModel = new JSONModel({
              busy: true,
              delay: 0
            });

          this.getRouter()
            .getRoute("object")
            .attachPatternMatched(this._onObjectMatched, this);

          // Store original busy indicator delay, so it can be restored later on
          iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
          this.setModel(oViewModel, "objectView");
          this.getOwnerComponent()
            .getModel()
            .metadataLoaded()
            .then(function() {
              // Restore original busy indicator delay for the object view
              oViewModel.setProperty("/delay", iOriginalBusyDelay);
            });
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Event handler when the share in JAM button has been clicked
         * @public
         */
        onShareInJamPress: function() {
          var oViewModel = this.getModel("objectView"),
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

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched: function(oEvent) {
          var oArgs = oEvent.getParameter("arguments");

          var oModel = this.getModel("helper");
          var sPernr = oArgs.objectId;
          var oBegda = this._toDate(oArgs.endda);
          oBegda.setDate(1);
          oBegda.setMonth(0);
          
          var oEndda = this._toDate(oArgs.endda);
console.log('begda', oBegda);
          oModel.setProperty("/store/timedetails/results", []);
          this.getModel()
            .metadataLoaded()
            .then(
              function() {
                var aFilters = [
                  new Filter({
                    filters: [
                      new Filter("SelPernr", FilterOperator.EQ, sPernr),
                      new Filter("SelBegda", FilterOperator.EQ, oBegda),
                      new Filter("SelEndda", FilterOperator.EQ, oEndda)
                    ],
                    and: true
                  })
                ];
                models.getEmpTimeDataSet(aFilters).then(function(oData) {
                  oModel.setProperty(
                    "/store/timedetails/results",
                    oData.results
                  );
                  oModel.setProperty("/ui/busy", false);
                });
              }.bind(this)
            );
        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView: function(sObjectPath) {
          var oViewModel = this.getModel("objectView"),
            oDataModel = this.getModel();

          this.getView().bindElement({
            path: sObjectPath,
            events: {
              change: this._onBindingChange.bind(this),
              dataRequested: function() {
                oDataModel.metadataLoaded().then(function() {
                  // Busy indicator on view should only be set if metadata is loaded,
                  // otherwise there may be two busy indications next to each other on the
                  // screen. This happens because route matched handler already calls '_bindView'
                  // while metadata is loaded.
                  oViewModel.setProperty("/busy", true);
                });
              },
              dataReceived: function() {
                oViewModel.setProperty("/busy", false);
              }
            }
          });
        },

        _toDate: function(sDate) {
          let sDD = sDate.substr(0, 2);
          let sMM = parseInt(sDate.substr(3, 2)) - 1;
          let sYYYY = sDate.substr(6, 4);

          var dateUI = new Date();
          dateUI.setMonth(sMM);
          dateUI.setDate(sDD);
          dateUI.setMonth(sMM); //for months with less than 30 days have to recall this method
          dateUI.setDate(sDD);
          dateUI.setFullYear(sYYYY);
          dateUI.setHours(0);
          dateUI.setMinutes(0);
          dateUI.setSeconds(0);
          var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
            pattern: 'dd-MM-YYYY'
          });
          var sNewDate = oDateFormat.format(dateUI);
          return dateUI;
        },

        _onBindingChange: function() {
          var oView = this.getView(),
            oViewModel = this.getModel("objectView"),
            oElementBinding = oView.getElementBinding();
        }
      }
    );
  }
);
