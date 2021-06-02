sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"com/apptech/app-bankinteg/controller/AppUI5",
	"sap/ui/core/Fragment",
	"sap/m/Dialog",
	"sap/m/ButtonType",
	"sap/m/Button",
	"sap/m/Text",
	"sap/m/MessageBox"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator, AppUI5, Fragment, Dialog, ButtonType, Button, Text, MessageBox) {
	"use strict";

	return Controller.extend("com.apptech.app-bankinteg.controller.BatchApprovalProcess", {

        onRoutePatternMatched: function (event) {
			document.title = "BFI BANKINTEG";
			this.fPrepareTable(false,"");
			this.oMdlAllRecord.refresh();
		},

		onInit: function () {
			//get DataBase loggedin
			this.sDataBase = jQuery.sap.storage.Storage.get("dataBase");	
			this.sUserCode = jQuery.sap.storage.Storage.get("userCode");
			
			var route = this.getOwnerComponent().getRouter().getRoute("BatchApprovalProcess");
     		route.attachPatternMatched(this.onRoutePatternMatched,this);
			
			this.oMdlEditRecord = new JSONModel("model/paymentprocessing.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");
			//document status
			this.oMdlDocStat = new JSONModel("model/documentstatus.json");
			this.getView().setModel(this.oMdlDocStat, "oMdlDocStat");
			this.oTableDetails = this.getView().byId("tblDetails");
			//set Tagging Date to current date
			this.getView().byId("DateTagged").setDateValue( new Date());
			//For Status
			this.sStatus = "";
			
			//CREATING MODEL SUPPLIER WITH OPEN AP---------------------
			//GET ALL BATCHCODE
			this.oMdlBatch = new JSONModel();
			this.fGetAllBatch();

			//getButtons
			this.oMdlButtons = new JSONModel();
			this.oResults = AppUI5.fGetButtons(this.sDataBase,this.sUserCode,"batchapprovalprocess");
			var newresult = [];
				this.oResults.forEach((e)=> {
					var d = {};
					d[e.U_ActionDesc] = JSON.parse(e.visible);
					newresult.push(JSON.parse(JSON.stringify(d)));
				});
			var modelresult = JSON.parse("{" + JSON.stringify(newresult).replace(/{/g,"").replace(/}/g,"").replace("[","").replace("]","") + "}");
			this.oMdlButtons.setJSON("{\"buttons\" : " + JSON.stringify(modelresult) + "}");
			this.getView().setModel(this.oMdlButtons, "buttons");
			
			//Create model for data fetch if record is existing
			this.oMdlExistingHeader = new JSONModel();
			this.oMdlExistingDetails = new JSONModel();
			
			this.aCols = [];
			this.aColsDetails = [];
			this.columnData = [];
			this.columnDataDetail = [];
			this.oEditRecord = {};
			this.iRecordCount = 0;
			this.oIconTab = this.getView().byId("tab1");
			this.oMdlAllRecord = new JSONModel();
			this.tableId = "tblDrafts";
			this.fPrepareTable(true);
		},
		fPrepareTable: function (bIsInit) {
			
			var aResults = this.fGetAllRecord();

			if (aResults.length !== 0) {

				this.aCols = Object.keys(aResults[0]);
				var i;
				this.iRecordCount = aResults.length;
				this.oIconTab.setCount(this.iRecordCount);
				if (bIsInit) {
					for (i = 0; i < this.aCols.length; i++) {
						this.columnData.push({
							"columnName": this.aCols[i]
						});
					}
				}
				this.oMdlAllRecord.setData({
					rows: aResults,
					columns: this.columnData
				});
				if (bIsInit) {
					this.oTable = this.getView().byId(this.tableId);
					this.oTable.setModel(this.oMdlAllRecord);
					this.oTable.bindColumns("/columns", function (sId, oContext) {
						var columnName = oContext.getObject().columnName;
						return new sap.ui.table.Column({
							label: columnName,
							template: new sap.m.Text({
								text: "{" + columnName + "}"
							})
						});
					});
					this.oTable.bindRows("/rows");
					this.oTable.setSelectionMode("Single");
					this.oTable.setSelectionBehavior("Row");
					this.fRenameColumns();
				}

			}

		},
		fRenameColumns: function () {
			this.oTable.getColumns()[0].setLabel("Batch Number");
			this.oTable.getColumns()[0].setFilterProperty("U_App_DocNum");
			this.oTable.getColumns()[1].setLabel("Supplier Code");
			this.oTable.getColumns()[1].setFilterProperty("U_App_Suppliercode");
			this.oTable.getColumns()[2].setLabel("Supplier Name");
			this.oTable.getColumns()[2].setFilterProperty("U_App_SupplierName");
			this.oTable.getColumns()[3].setLabel("Status");
			this.oTable.getColumns()[4].setLabel("Remarks");
			this.oTable.getColumns()[5].setLabel("Created Date");
			this.oTable.getColumns()[5].setFilterProperty("U_App_CreatedDate");
		},

		filterGlobally : function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;

			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("U_App_DocNum", FilterOperator.Contains, sQuery),
					new Filter("U_App_Suppliercode", FilterOperator.Contains, sQuery),
					new Filter("U_App_SupplierName", FilterOperator.Contains, sQuery),
					new Filter("U_App_Status", FilterOperator.Contains, sQuery),
					new Filter("U_App_CreatedDate", FilterOperator.Contains, sQuery)
				], false);
			}

			this._filter();
    	},
		_filter : function() {
			var oFilter = null;

			if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			}

			this.byId("tblDrafts").getBinding("rows").filter(oFilter, "Application");
		},
		clearAllFilters: function (oEvent) {
			var oTable = this.getView().byId("tblDrafts");
	
			this._oGlobalFilter = null;
			this._filter();
	
			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		},
		
		
		//GET ALL BATCHCODE
		fGetAllBatch: function(){
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName="+ this.sDataBase +"&procName=spAppBankIntegration&QUERYTAG=getAllBatch&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					console.error(Message);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					this.oMdlBatch.setJSON("{\"allbatch\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlBatch, "oMdlBatch");
				}
			});
		},	
		fGetAllRecord: function (queryTag) {
			var aReturnResult = [];
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName="+ this.sDataBase +"&procName=spAppBankIntegration&QUERYTAG=getAllSavedRecord&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					aReturnResult = [];
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					console.error(Message);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results.length <= 0) {
					aReturnResult = [];
				} else {
					var oRecord = {};
					oRecord.oRecord_Details = [];
					var oRecordDetails = {};
					for (var d = 0; d < results.length; d++) {
						oRecordDetails.U_App_DocNum = results[d].U_App_DocNum;
						oRecordDetails.U_App_Suppliercode = results[d].U_App_Suppliercode;
						oRecordDetails.U_App_SupplierName = results[d].U_App_SupplierName.replace('Ã', 'Ñ');
						oRecordDetails.U_App_Status = results[d].U_App_Status;
						oRecordDetails.U_App_Remarks = results[d].U_App_Remarks;
						oRecordDetails.U_App_CreatedDate = results[d].U_App_CreatedDate;
						oRecord.oRecord_Details.push(JSON.parse(JSON.stringify(oRecordDetails)));
					}
					aReturnResult = oRecord.oRecord_Details;
				}
			});
			return aReturnResult;

		},
		
		onView: function(oEvent){
			var iIndex = this.oTable.getSelectedIndex();
			var BatchNum = "";
			var sStatus = "";
			if (iIndex !== -1) {
				var oRowSelected = this.oTable.getBinding().getModel().getData().rows[this.oTable.getBinding().aIndices[iIndex]];
				BatchNum = oRowSelected.U_App_DocNum;
				sStatus = oRowSelected.U_App_Status;
			}
			
			var queryTag = "",value1 = "",value2 ="",value3="",value4 = "",dbName = "SBODEMOAU_SL";
			value1 = BatchNum;
			this.getSearchDataHead(dbName, "spAppBankIntegration", "getHeaderDat", value1, value2, value3, value4);
			this.getSearchDataDet(dbName, "spAppBankIntegration", "getBatch_Data", value1, value2, value3, value4);
			
			this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("TRANSACTION Code : " + BatchNum + " [EDIT]");
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
		},
		
		//Generic selecting of data
		getSearchDataHead: function(dbName,procName,queryTag,value1,value2,value3,value4){
			//get all open AP base on parameters
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName="+ this.sDataBase +"&procName="+ procName +"&QUERYTAG=" + queryTag
				+"&VALUE1="+ value1 +"&VALUE2="+ value2 +"&VALUE3="+ value3 +"&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					console.error(Message);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					var oRecord = {};
					oRecord.oRecord_Details = [];
					var oRecordDetails = {};
					for (var d = 0; d < results.length; d++) {

						oRecordDetails.Code = results[d].Code;
						oRecordDetails.DateFrom = results[d].DateFrom;
						oRecordDetails.DateTagged = results[d].DateTagged;
						oRecordDetails.DateTo = results[d].DateTo;
						oRecordDetails.DocumentNo = results[d].DocumentNo;
						oRecordDetails.Remarks = results[d].Remarks;
						oRecordDetails.Status = results[d].Status;
						oRecordDetails.SupplierCode = results[d].SupplierCode;
						oRecordDetails.SupplierName = results[d].SupplierName.replace('Ã', 'Ñ');

						oRecord.oRecord_Details.push(JSON.parse(JSON.stringify(oRecordDetails)));
					}
					var oResult = JSON.stringify(oRecord.oRecord_Details).replace("[", "").replace("]", "");
					this.oMdlEditRecord.setJSON("{\"EditRecord\" : " + oResult + "}");
					this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");
					this.oMdlEditRecord.refresh();
				}
			});
		},
		
		getSearchDataDet: function(dbName,procName,queryTag,value1,value2,value3,value4){
			this.oMdlAP = new sap.ui.model.json.JSONModel();
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName="+ this.sDataBase +"&procName=spAppBankIntegration&QUERYTAG=" + queryTag
				+"&VALUE1="+ value1 +"&VALUE2="+ value2 +"&VALUE3="+ value3 +"&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					console.error(Message);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					this.oMdlAP.setJSON("{\"allopenAP\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlAP, "oMdlAP");
				}
			});
		},
		getTodaysDate: function () {
			var today = new Date();
			var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			return date ;
		},
		onApprove: function(oEvent){
			AppUI5.fShowBusyIndicator(4000);
			var table= "";
			var code = "";
			var Data;
			var oT_PAYMENT_PROCESSING_H = {};
			table = "U_APP_OPPD";
			var batchNum = this.byId("DocumentNo").getValue();
			var remarks = this.byId("Remarks").getValue();
			code = this.oMdlEditRecord.getData().EditRecord.Code;
			oT_PAYMENT_PROCESSING_H.U_App_Status = "Approved";
			oT_PAYMENT_PROCESSING_H.U_App_Remarks = remarks;
			oT_PAYMENT_PROCESSING_H.U_App_UpdatedBy= this.sUserCode;
			oT_PAYMENT_PROCESSING_H.U_App_UpdatedDate = this.getTodaysDate();
			Data = JSON.stringify(oT_PAYMENT_PROCESSING_H);
			
			this.updateRecords(table, code, Data,batchNum,true);
			AppUI5.fHideBusyIndicator();
			
		},
		//Reject Process
		onReject: async function(oEvent){
			AppUI5.fShowBusyIndicator(4000);
			var table= "";
			var code = "";
			var Data;
			var oT_PAYMENT_PROCESSING_H = {};
			table = "U_APP_OPPD";
			var batchNum = this.byId("DocumentNo").getValue();
			var remarks = this.byId("Remarks").getValue();
			code = this.oMdlEditRecord.getData().EditRecord.Code;
			oT_PAYMENT_PROCESSING_H.U_App_Status = "Rejected";
			oT_PAYMENT_PROCESSING_H.U_App_Remarks = remarks;
			oT_PAYMENT_PROCESSING_H.U_App_UpdatedBy= this.sUserCode;
			oT_PAYMENT_PROCESSING_H.U_App_UpdatedDate = this.getTodaysDate();
			Data = JSON.stringify(oT_PAYMENT_PROCESSING_H);
			
			await this.updateRecords(table, code, Data,batchNum,false);
			AppUI5.fHideBusyIndicator();
		},
		updateRecords: function(table,code,Data,batchNum,isApprove){
			$.ajax({
				url: "https://sl-test.biotechfarms.net/b1s/v1/"+table+"('"+code+"')",
				type: "PATCH",
				contentType: "application/json",
				async: false,
				data: Data, //If batch, body data should not be JSON.stringified
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var oMessage = xhr.responseJSON["error"].message.value;	
					AppUI5.fErrorLogs(table,"Update Batch",code,"null",oMessage,"Update",this.sUserCode,"null",Data);		
					sap.m.MessageToast.show(oMessage);
					console.error(oMessage);
				},
				success: function (json) {
					//this.oPage.setBusy(false);
					if (isApprove === true){
						sap.m.MessageToast.show("Batch : " + batchNum + " approved!");
					}else{
						sap.m.MessageToast.show("Batch : " + batchNum + " rejected!");
					}
					this.fPrepareTable(false);
					this.oMdlAllRecord.refresh();
				},
				context: this

			}).done(function (results) {
				if (results) {
					if (isApprove === true){
						sap.m.MessageToast.show("Batch : " + batchNum + " approved!");
						this.getView().byId("Status").setValue("Approved");
					}else{
						sap.m.MessageToast.show("Batch : " + batchNum + " rejected!");
						this.getView().byId("Status").setValue("Rejected");
					}
					this.getView().byId("btnApprove").setEnabled(false);
					this.getView().byId("btnReject").setEnabled(false);
					this.fPrepareTable(false);
					this.oMdlAllRecord.refresh();
				}
			});
		}
	});

});
