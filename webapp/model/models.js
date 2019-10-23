sap.ui.define(
	[
		"sap/ui/model/json/JSONModel",
		"sap/ui/Device",
		"sap/ui/model/odata/v2/ODataModel",
		"sap/ui/model/odata/CountMode",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	],
	function (JSONModel, Device, ODataModel, CountMode, Filter, FilterOperator) {
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
				var oToday = new Date();

				var month = oToday.getUTCMonth() + 1; //months from 1-12
				var day = oToday.getUTCDate();
				var year = oToday.getUTCFullYear();

				var newdate = year + "-" + month + "-" + day;

				var oModel = new JSONModel({
					store: {
						timedata: {
							results: []
						},
						timedetails: {
							results: [],
							current: {
								Pernr: null,
								Ename: null,
								Begda: null,
								Endda: null
							}
						},
						userdata: {}
					},
					filter: {
						jaar: new Date().getFullYear(),
						startdatum: null,
						totenmet: newdate,
						intern: true
					},
					ui: {
						busy: true,
						showOrgUnitColumn: false
					},
					valuehelp: {
						orgunits: null
					}
				});
				return oModel;
			},

			getEmployeeDetailData: function (oModel) {
				var oDataModel = this._getODataModel();

				return new Promise(function (resolve, reject) {
					oDataModel.read("/Employees('')", {
						success: function (oData) {
							if (oData) {
								// if there is data, resolve promise
								resolve(oData);
							} else {
								reject({
									message: "Geen employee informatie gevonden",
									responseText: "nodata"
								});
							}
						},
						error: function (oError) {
							reject(oError);
						}
					});
				});
			},

			getTimeData: function (aFilters) {
				var oDataModel = this._getODataModelWTR();

				return new Promise(function (resolve, reject) {
					oDataModel.read("/TeamTimeDataSet", {
						filters: aFilters,
						// urlParameters : {
						//   "$top" : "10"
						// },
						success: function (oData) {
							if (oData) {
								// if there is data, resolve promise
								resolve(oData);
							} else {
								reject({
									message: "Geen employee informatie gevonden",
									responseText: "nodata"
								});
							}
						},
						error: function (oError) {
							reject(oError);
						}
					});
				});
			},

			getEmpTimeDataSet: function (aFilters) {
				var oDataModel = this._getODataModelWTR();

				return new Promise(function (resolve, reject) {
					oDataModel.read("/MWTimeDataSet", {
						filters: aFilters,
						success: function (oData) {
							if (oData) {
								// if there is data, resolve promise
								resolve(oData);
							} else {
								reject({
									message: "Geen employee informatie gevonden",
									responseText: "nodata"
								});
							}
						},
						error: function (oError) {
							reject(oError);
						}
					});
				});
			},

			/**
			 * generic reference to odata service ZPNB_HR_GEN_SRV
			 */
			_getODataModel: function () {
				if (!this._oDataModel) {
					this._oDataModel = new ODataModel(
						"/sap/opu/odata/sap/ZPNB_HR_GEN_SRV"
					);
					this._oDataModel.setDefaultCountMode(CountMode.None);
					this._oDataModel.setUseBatch(false);
				}
				return this._oDataModel;
			},

			/**
			 * generic reference to odata service ZPNB_HR_GEN_SRV
			 */
			_getODataModelWTR: function () {
				if (!this._oDataModelWTR) {
					this._oDataModelWTR = new ODataModel(
						"/sap/opu/odata/sap/ZPNB_HR_WTR_SRV"
					);
					this._oDataModelWTR.setDefaultCountMode(CountMode.None);
					this._oDataModelWTR.setUseBatch(false);
				}
				return this._oDataModelWTR;
			}

		};
	}
);