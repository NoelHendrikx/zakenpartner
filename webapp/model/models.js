sap.ui.define(
	[
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/model/odata/v2/ODataModel",
		"sap/ui/model/odata/CountMode",
		"sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "nl/peppieportals/library/utils/models"
	],
	function (JSONModel, Device, ODataModel, CountMode, Filter, FilterOperator, pnbmodels) {
		"use strict";

		return {
      _oDataModel: null,
      _oDataModelWTR: null,

      createDeviceModel: function () {
        var oModel = new JSONModel(Device);
        oModel.setDefaultBindingMode("OneWay");
        return oModel;
      },

      createAppModel: function () {
        var oModel = new JSONModel({
          store: {
            zakenpartner: {
              results: [],
              details: this.getInitialStructure(),
            },
            userdata: {},
          },
          ui: {
            busy: true,
            editable: false,
            showcorsanummer: false,
          },
          valuehelp: {},
        });
        pnbmodels.getEntityLijstwaarde("ZBC_ZAKENPARTNER_MUTATIE").then(function (oValueHelp) {
            oModel.setProperty("/valuehelp/zakenpartner", oValueHelp);
          });
        oModel.setDefaultBindingMode("TwoWay");
        return oModel;
      },

      getInitialStructure : function(){
        return {
          Achternaam: "",
          BankDetails:{ results : [this.getBankDetail()]},
          Bedrijf1000: false,
          Bedrijf6000: false,
          Bsn: "",
          BtwNummer: "",
          Email: "",
          Gm: false,
          GmMoAantekening: false,
          GmOsrNaam: "",
          GmSoortPartner: "",
          Iban: "",
          IbanRekhouder: "",
          Initialen: "",
          KvkNummer: "",
          KvkVestiging: "",
          Landcode: "NL",
          Mobiel: "",
          Naam1: "",
          Naam2: "",
          Opmerking: "",
          Partner: "",
          Plaats: "",
          PostbusNummer: "",
          PostbusPlaats: "",
          PostbusPostcode: "",
          Postcode: "",
          RolAankopendePartij: false,
          RolContactpersoon: false,
          RolContractant: false,
          RolContractpartner: false,
          RolCrediteur: false,
          RolDebiteur: false,
          RolKadaster: false,
          RolKadasterkantoor: false,
          RolKlant: false,
          RolLeverancier: false,
          RolMedecontractant: false,
          RolNotaris: false,
          RolVastgoed: false,
          RolVerhuurder: false,
          RolVerkopendePartij: false,
          RolVerzeker: false,
          SoortVestiging: "",
          SoortZakenpartner: "1",
          StraatHuisnr: "",
          StraatNaam: "",
          StraatToevoeging: "",
          Telefoon: "",
          Voornaam: "",
          Website: "",
          Zoekargument: ""
        }   
      },

      getBankDetail : function(){
        return {
            Bankiban: "",
            BankibanRekhouder: "",
            Bankid: "",
            Bankkey: "",
            Bankland: "",
            Bankrekening: "",
            Partner: ""
        }
      },

      getZakenpartnerData: function (sPartner) {
        var oDataModel = this._getODataModel();

        return new Promise(function (resolve, reject) {
          oDataModel.read("/ZakenpartnerMutatieSet('" + sPartner + "')", {
            urlParameters: {
              $expand: "BankDetails",
            },
            success: function (oData) {
              if (oData) {
                // if there is data, resolve promise
                resolve(oData);
              } else {
                reject({
                  message: "Geen zakenpartner informatie gevonden",
                  responseText: "nodata",
                });
              }
            },
            error: function (oError) {
              reject(oError);
            },
          });
        });
      },

      createZakenpartnerData: function (oPostData) {
        var oDataModel = this._getODataModel();
        
        return new Promise(function (resolve, reject) {
          oDataModel.create("/ZakenpartnerMutatieSet", oPostData, {
            success: function (oData) {
              if (oData) {
                // if there is data, resolve promise
                resolve(oData);
              } else {
                reject({
                  message: "Geen zakenpartner informatie gevonden",
                  responseText: "nodata",
                });
              }
            },
            error: function (oError) {
              reject(oError);
            },
          });
        });
      },




      /**
       * generic reference to odata service ZPNB_ZAKENPARTNER_SRV
       */
      _getODataModel: function () {
        if (!this._oDataModel) {
          this._oDataModel = new ODataModel("/sap/opu/odata/sap/ZPNB_ZAKENPARTNER_SRV");
          this._oDataModel.setDefaultCountMode(CountMode.None);
          this._oDataModel.setUseBatch(false);
        }
        return this._oDataModel;
      },
    };
	}
);