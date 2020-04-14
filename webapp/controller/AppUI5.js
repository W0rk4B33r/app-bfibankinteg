sap.ui.define([
	"jquery.sap.global",
	"sap/ui/Device",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Popover",
	"sap/m/Button",
	"sap/m/library",
	"sap/m/MessageToast",
	"sap/ui/core/BusyIndicator"
], function (jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast,BusyIndicator) {
	"use strict";
	return ("com.apptech.app-bankinteg.controller.AppUI5",{

		/*
		Guide on improving Apptech JS library:
		1. Make sure that all functions are independent to the your app. Always use method parameters to get necessary data.
		2. Always return a value; and don't interact with the calling js.
		*/
		/*
		Generic function helper to create table.
		@@ params : Table Name  
					Table Description
					Table Type  - ("bott_Document","bott_DocumentLines",
									"bott_MasterData","bott_MasterDataLines",
									"bott_NoObject","bott_NoObjectAutoIncrement")
		*/
		createTable: function (sTableName, sDescription, sTableType) {
			var tableInfo = {};
			tableInfo.TableName = sTableName;
			tableInfo.TableDescription = sDescription;
			tableInfo.TableType = sTableType;

			var stringTableInfo = JSON.stringify(tableInfo);
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/UserTablesMD",
				data: stringTableInfo,
				type: "POST",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					return error;
				},
				success: function (json) {
					return 0;
				},
				context: this
			});

		},

		/*
		Generic function helper to create field.
		@@ params : Field Name
					Field Description
					Table Name - ex. "@APP_OAMS"
					Field Type - ("db_Alpha", "db_Date","db_Float","db_Memo","db_Numeric")
					Field SubType - ("st_Percentage", "st_Price", "st_Quantity", "st_Rate", "st_Sum", "st_Image")
					Character Size 
		*/
		createField: function (sFieldName, sDescription, sTableName, sType, sSubType, iSize) {
			var oFieldInfo = {};
			if (sFieldName === undefined || sDescription === undefined || sTableName === undefined) {
				return -1;
			}

			oFieldInfo.Description = sDescription;
			oFieldInfo.Name = sFieldName;
			oFieldInfo.TableName = sTableName;
			oFieldInfo.Type = sType;

			if (iSize === undefined || sType === "db_Numeric") {
				iSize = 11;
			}

			oFieldInfo.EditSize = iSize;
			oFieldInfo.Size = iSize;

			if (sType === "db_Float" || (!sSubType === undefined)) {
				oFieldInfo.SubType = sSubType;
			}

			var dataString = JSON.stringify(oFieldInfo);

			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/UserFieldsMD",
				data: dataString,
				type: "POST",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					return error;
				},
				success: function (json) {

					return 0;
				},
				context: this
			});

			return -1;

		},

		createMandatoryFields: function (sTableName) {
			// createField()
			this.createField("App_CreatedDate", "Created Date", sTableName, "db_Date", undefined, undefined);
			this.createField("App_CreatedBy", "Created By", sTableName, "db_Alpha", undefined, undefined);
			this.createField("App_UpdatedDate", "Updated Date", sTableName, "db_Date", undefined, undefined);
			this.createField("App_UpdatedBy", "Created By", sTableName, "db_Alpha", undefined, undefined);
			/*
			U_App_CreatedDate
			U_App_CreatedBy
			U_App_UpdatedDate
			U_App_UpdatedBy
			*/
		},

		generateUDTCode: function (docType) {

			var generatedCode = "";

			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GENERATENUMBER&DocType="+ docType,
				type: "GET",
				dataType: "json",
				async: false,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					
						sap.m.MessageToast.show(error);
				},
				success: function (json) {
					generatedCode = json[0][""];

				},
				context: this
			}).done(function (results) {
				if (results) {
					if (docType === "GetCode"){
						generatedCode = results[0][""];
					}else{
						generatedCode = results[0]["Code"];
					}
				}
			});
			return generatedCode;
		},

		generateDocNum: function (sTableName) {
			var docNum = 0;

			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_RE_GETDOCNUM&tableName=" +
					sTableName,
				type: "GET",
				dataType: "json",
				async: false,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					jQuery.sap.log.error("This should never have happened!");
				},
				success: function (json) {
					docNum = json[0][""];

				},
				context: this
			}).done(function (results) {
				if (results) {
					docNum = results[0][""];

				}
			});

			return docNum;
		},

		prepareBatchRequestBody: function (oRequest) {

			var batchRequest = "";

			var beginBatch = "--a\nContent-Type: multipart/mixed;boundary=b\n\n";
			var endBatch = "--b--\n--a--";

			batchRequest = batchRequest + beginBatch;

			var objectUDT = "";
			for (var i = 0; i < oRequest.length; i++) {

				objectUDT = oRequest[i];
				batchRequest = batchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
				batchRequest = batchRequest + "POST /b1s/v1/" + objectUDT.tableName;
				batchRequest = batchRequest + "\nContent-Type: application/json\n\n";
				batchRequest = batchRequest + JSON.stringify(objectUDT.data) + "\n\n";
			}

			batchRequest = batchRequest + endBatch;

			return batchRequest;

		},

		getTodaysDate: function () {
			var today = new Date();
			var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			return date ;
		},

		replaceKeyJSON: function (keyToBeReplace, newKey, oJSON) {
			var strJSON = JSON.stringify(oJSON);
			strJSON = strJSON.replace(/\"keyToBeReplace":/g, "\"newKey\":");
			return JSON.parse(strJSON);
		},

		postData: function (oPostData, sURL) {
			var returnValue = 0;
			var res = {} ;
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/PostData.xsjs?dbName=APP_RE",
				type: "POST",
				async: false,
				data: JSON.stringify(oPostData),
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					res.Result = "Failed";
					res.Cause = xhr.responseText;
					returnValue = res;
					jQuery.sap.log.error("error on AppUi5.postData() " + xhr.responseText);
					
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					returnValue = 0;
				}
			});

			return returnValue;
		},

		getAllByColumn: function (tableName, columnName, columnValue) {
			var getAllByColumnURL = "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA_BYCOL&tableName=" +
				tableName + "&colName=" + columnName + "&colValue=" + columnValue;
			$.ajax({
				url: getAllByColumnURL,
				type: "GET",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					jQuery.sap.log.error("error on AppUi5.getAllByColumn() " + xhr.responseText);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length <= 0) {
					return results;
				}
			});
		},

		getDatePostingFormat: function (sDate) {
			var year = new Date(sDate).getYear() + 1900;
			var month = new Date(sDate).getMonth() + 1;
			var date = new Date(sDate).getDate();
			return month + "/" + date + "/" + year;
		},

		generateNumber: function (sDocType) {
			var generateNumberURL = "";
			switch (sDocType) {
			case "Quote":
				generateNumberURL = "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GENERATENUMBER&DocType=Quote";
				break;
			case "Reservation":
				generateNumberURL = "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GENERATENUMBER&DocType=Reservation";
				break;
			case "Contract":
				generateNumberURL = "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GENERATENUMBER&DocType=Contract";
				break;
			}
			var returnCode = [];
			$.ajax({
				url: generateNumberURL,
				type: "GET",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					jQuery.sap.log.error("error on AppUi5.generateNumber() " + xhr.responseText);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length > 0) {
					returnCode = results;
				} else {
					returnCode = [];
				}
			});

			return returnCode;
		},

		//Returning and array of all columns and rows for specific table in specified Key Column
		//If error, this will return empty array
		getAllDataByKeyAJAX: function (sTableName, sKeyCode, sQueryType) {
			var aReturnResult = [];
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA_BYKEY&tableName=" + sTableName +
					"&keyCode=" + sKeyCode + "&queryType=" + sQueryType,
				type: "GET",
				xhrFields: {
					withCredentials: true
				},
				async: false,
				error: function (xhr, status, error) {
					return [];
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length <= 0) {
					aReturnResult = [];
				} else {
					aReturnResult = results;
				}
			});

			return aReturnResult;
		},

		getHANAData: function (sModule, sQueryType, sKey, sKey2) {
			var aReturnResult = [];
			var sURL = "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_" + sModule + "&queryType=" + sQueryType +
				"&colValue=" + sKey + "&colValue=" + sKey2;
			$.ajax({
				url: sURL,
				type: "GET",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					aReturnResult = [];
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length <= 0) {
					aReturnResult = [];
				} else {
					aReturnResult = results;
				}
			});
			return aReturnResult;

		},

		getAllDataByColAJAX: function (sTableName, sColName, sColValue, sQueryType) {
			var aReturnResult = [];
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=APP_RE&procName=SPAPP_RE_GETALLDATA_BYCOL&tableName=" + sTableName +
					"&colName=" + sColName + "&colValue=" + sColValue + "&queryType=" + sQueryType,
				type: "GET",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					aReturnResult = [];
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length <= 0) {
					aReturnResult = [];
				} else {
					aReturnResult = results;
				}
			});
			return aReturnResult;
		},
		fGetButtons: function(sDatabase,sUserCode,sModule){
			var aReturnResult = [];
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName="+ sDatabase +"&procName=spAppBankIntegration&QUERYTAG=getButtons" +
				"&VALUE1="+ sUserCode +"&VALUE2="+ sModule +"&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					aReturnResult = results;
				}
			});
			return aReturnResult;
		},
		fErrorLogs: function (sTableAffected,sOperation,sKey1,sKey2,sErrorDesc,sProcess,sProcessBy,sKey3,sRequest) {
			//var returnValue = 0;
			var oDate = this.getTodaysDate();
			var sCode = this.generateUDTCode("GetLogCode");
			var sBodyRequest = {};
			sBodyRequest.Code = sCode,
			sBodyRequest.Name = sCode,
			sBodyRequest.U_TableAffected = sTableAffected,
			sBodyRequest.U_Operation = sOperation,
			sBodyRequest.U_Key1 = sKey1,
			sBodyRequest.U_Key2 = sKey2,
			sBodyRequest.U_ErrorDesc = sErrorDesc,
			sBodyRequest.U_Process = sProcess,
			sBodyRequest.U_ProcessBy = sProcessBy,
			sBodyRequest.U_ProcessDate = oDate,
			sBodyRequest.U_Key3 = sKey3
			sBodyRequest.U_INPUTBODY = sRequest

			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/U_APP_ERRORLOGS",
				type: "POST",
				contentType: "multipart/mixed;boundary=a",
				data: JSON.stringify(sBodyRequest),
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					// var Message = xhr.responseJSON["error"].message.value;			
					// sap.m.MessageToast.show(Message);
					// AppUI5.fHideBusyIndicator();
				},
				success: function (json) {
					//sap.m.MessageToast.show("Success saving Batch: " + BatchCode );
				},
				context: this

			}).done(function (results) {
				if (results) {
					//
				}
			});
			//return returnValue;
		},

		renameKey: function (obj, old_key, new_key) {
			if (old_key !== new_key) {
				Object.defineProperty(obj, new_key, Object.getOwnPropertyDescriptor(obj, old_key));
				delete obj[old_key]; 
			}
		},
		
		deleteKey: function(obj, delete_key){
			delete obj[delete_key];
		},
		
		addKey: function(obj, add_key, add_value){
			obj[add_key] = add_value;
		},
		Logout: function(){
			// jQuery.sap.storage.Storage.clear();	
			// this.router = this.getOwnerComponent().getRouter();
			// sap.ui.core.UIComponent.getRouterFor(this).navTo("Login", null, true);
		},
		selectedDatabase: function(db){
			return this.sDBCompany;
		},
		//NDC 03/24/2020
		//added busy indicator
		fHideBusyIndicator : function() {
			BusyIndicator.hide();
		},

		fShowBusyIndicator : function (iDuration, iDelay) {
			BusyIndicator.show(iDelay);

			if (iDuration && iDuration > 0) {
				if (this._sTimeoutId) {
					clearTimeout(this._sTimeoutId);
					this._sTimeoutId = null;
				}

				this._sTimeoutId = setTimeout(function() {
					this.fHideBusyIndicator();
				}.bind(this), iDuration);
			}
		}
		

	});

});