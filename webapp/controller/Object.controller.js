/*global location*/
sap.ui.define(
  [
    "nl/peppieportals/zakenpartner/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",

    "nl/peppieportals/zakenpartner/model/formatter",
    "nl/peppieportals/zakenpartner/model/models",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast"
  ],
  function (BaseController, JSONModel, History, formatter, models, Filter, FilterOperator, MessageToast) {
    "use strict";

    return BaseController.extend("nl.peppieportals.zakenpartner.controller.Object", {
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
            delay: 0,
          });

        this.getRouter().getRoute("aanmaken").attachPatternMatched(this._onObjectMatched, this);
        this.getRouter().getRoute("tonen").attachPatternMatched(this._onObjectMatched, this);

        // Store original busy indicator delay, so it can be restored later on
        iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
        this.setModel(oViewModel, "objectView");
        this.getOwnerComponent()
          .getModel()
          .metadataLoaded()
          .then(function () {
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
      onShareInJamPress: function () {
        var oViewModel = this.getModel("objectView"),
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
        var oArgs = oEvent.getParameter("arguments");
        var sRouteName = oEvent.getParameter("name");

        console.log("evt", oEvent);
        var oModel = this.getModel("helper");
        var sPartner = oArgs.objectId; // tonen = zakenpartner id, aanmaken = type partner

        if (sRouteName === "tonen") {
          models.getZakenpartnerData(sPartner).then(function (oPartner) {
            oModel.setProperty("/ui/editable", false);
            oModel.setProperty("/store/zakenpartner/details", oPartner);
          });
        } else {
          // zet zakenpartner type
          oModel.setProperty("/store/zakenpartner/details", models.getInitialStructure());
          oModel.setProperty("/store/zakenpartner/details/SoortZakenpartner", sPartner);
          oModel.setProperty("/ui/organisatie", sPartner === "2");
          oModel.setProperty("/ui/persoon", sPartner === "1");
          oModel.setProperty("/ui/editable", true);
        }
      },

      onSelectShowCorsaNummer: function () {
        var oModel = this.getModel("helper");
        oModel.setProperty("/ui/showcorsanummer", !oModel.getProperty("/ui/showcorsanummer"));
      },

      onPressEdit: function () {
        var oModel = this.getModel("helper");
        oModel.setProperty("/ui/editable", true);
      },

      onPressCancel: function () {
        var oModel = this.getModel("helper");
        oModel.setProperty("/ui/editable", false);
      },

      onPressSave: function () {
        var oModel = this.getModel("helper");
        var that = this;
        var oPayload = oModel.getProperty("/store/zakenpartner/details");
        models.createZakenpartnerData(oPayload).then(function (oPartner) {
          MessageToast.show("Zakenpartner is aangevraagd en moet worden verwerkt.", {
            duration: 3000,
            closeOnBrowserNavigation: false,
          });
          that.getRouter().navTo("worklist");
        });
      },

      onPressAddBankRow: function () {
        var oModel = this.getModel("helper");
        var aBank = oModel.getProperty("/store/zakenpartner/details/BankDetails/results")
          ? oModel.getProperty("/store/zakenpartner/details/BankDetails/results")
          : [];
        var oBankDetail = models.getBankDetail();
        aBank.push(oBankDetail);
        oModel.setProperty("/store/zakenpartner/details/BankDetails/results", aBank);
      },

      onPressDeleteBankRow: function (oEvt) {
        var oModel = this.getModel("helper");
        var sDeletePath = oEvt.getParameter("listItem").getBindingContext("helper").getPath();
        var iDeleteEntry = sDeletePath.substr(sDeletePath.lastIndexOf("/") + 1);
        var aBank = oModel.getProperty("/store/zakenpartner/details/BankDetails/results");
        aBank.splice(iDeleteEntry, 1);
        // remove entry
        oModel.setProperty("/store/zakenpartner/details/BankDetails/results", aBank);
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
            },
          },
        });
      },

      _toDate: function (sDate) {
        var sDD = sDate.substr(0, 2);
        var sMM = parseInt(sDate.substr(3, 2)) - 1;
        var sYYYY = sDate.substr(6, 4);

        var dateUI = new Date();
        dateUI.setMonth(sMM);
        dateUI.setDate(sDD);
        dateUI.setMonth(sMM); //for months with less than 30 days have to recall this method
        dateUI.setDate(sDD);
        dateUI.setFullYear(sYYYY);
        dateUI.setHours(12); // set to 12 hours to avoid timezone issues (not required right now)
        dateUI.setMinutes(0);
        dateUI.setSeconds(0);
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: "dd-MM-YYYY",
        });
        var sNewDate = oDateFormat.format(dateUI);

        return dateUI;
      },

      _onBindingChange: function () {
        var oView = this.getView(),
          oViewModel = this.getModel("objectView"),
          oElementBinding = oView.getElementBinding();
      },
    });
  }
);
