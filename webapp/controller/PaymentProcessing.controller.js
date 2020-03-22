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

	return Controller.extend("com.apptech.app-bankinteg.controller.PaymentProcessing", {

        onRoutePatternMatched: function (event) {
			document.title = "BFI BANKINTEG";
		},

		onInit: function () {
			//get DataBase loggedin
			this.dataBase = jQuery.sap.storage.Storage.get("dataBase");	
			this.userCode = jQuery.sap.storage.Storage.get("userCode");	
			
			this.oMdlEditRecord = new JSONModel("model/paymentprocessing.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");
			//document status
			this.oMdlDocStat = new JSONModel("model/documentstatus.json");
			this.getView().setModel(this.oMdlDocStat, "oMdlDocStat");
			this.oTableDetails = this.getView().byId("tblDetails");
			//set Tagging Date to current date
			this.getView().byId("DateTagged").setDateValue( new Date());
			//For Status
			this.Status = "";
			
			
			//CREATING MODEL SUPPLIER WITH OPEN AP
			this.oMdlSupplier = new JSONModel();
			this.getAllSupplier();
			//CREATING MODEL SUPPLIER WITH OPEN AP---------------------
			//GET ALL BATCHCODE
			this.oMdlBatch = new JSONModel();
			this.getAllBatch();
			
			
			this.aCols = [];
			this.aColsDetails = [];
			this.columnData = [];
			this.columnDataDetail = [];
			this.oEditRecord = {};
			this.iRecordCount = 0;
			this.oIconTab = this.getView().byId("tab1");
			this.oMdlAllRecord = new JSONModel();
			this.tableId = "tblDrafts";
			this.prepareTable(true);
			
			
		},
		prepareTable: function (bIsInit) {
			
			var aResults = this.getAllRecord();

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
					this.renameColumns();
				}

			}

		},
		renameColumns: function () {
			this.oTable.getColumns()[0].setLabel("Batch Number");
			this.oTable.getColumns()[0].setFilterProperty("U_App_DocNum");
			this.oTable.getColumns()[1].setLabel("Supplier Code");
			this.oTable.getColumns()[1].setFilterProperty("U_App_Suppliercode");
			this.oTable.getColumns()[2].setLabel("Supplier Name");
			this.oTable.getColumns()[2].setFilterProperty("U_App_SupplierName");
			this.oTable.getColumns()[3].setLabel("Status");
			this.oTable.getColumns()[4].setLabel("Remarks");
			this.oTable.getColumns()[5].setLabel("Created Date");
		},
		//GET ALL BATCHCODE
		getAllBatch: function(){
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName="+ this.dataBase +"&procName=spAppBankIntegration&QUERYTAG=getAllBatch&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					// if (xhr.status === 400) {
					// 	sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
					// 	sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
					// }else{
					// 	sap.m.MessageToast.show(error);
					// }
						sap.m.MessageToast.show(error);
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
		getAllRecord: function (queryTag) {
			var aReturnResult = [];
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName="+ this.dataBase +"&procName=spAppBankIntegration&QUERYTAG=getAllRecord&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					aReturnResult = [];
					sap.m.MessageToast.show(error);
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
		//GET ALL BATCHCODE----------------
		//CREATING MODEL SUPPLIER WITH OPEN AP
		getAllSupplier: function(){
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName="+ this.dataBase +"&procName=spAppBankIntegration&QUERYTAG=getAllBPwithOpenAP&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
						sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					this.oMdlSupplier.setJSON("{\"allsupplierwithopenap\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlSupplier, "oMdlSupplier");
				}
			});
		},	
		//CREATING MODEL SUPPLIER WITH OPEN AP---------------------
		//BP FRAGMENT -------------------
		handleValueHelpSupplier: function () {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "com.apptech.app-bankinteg.view.fragments.SupplierDialogFragment",
					controller: this
				}).then(function (oValueHelpDialog) {
					this._oValueHelpDialog = oValueHelpDialog;
					this.getView().addDependent(this._oValueHelpDialog);
					this._configValueHelpDialog();
					this._oValueHelpDialog.open();
				}.bind(this));
			} else {
				this._configValueHelpDialog();
				this._oValueHelpDialog.open();
			}
		},
		_configValueHelpDialog: function () {
			var sInputValue = this.byId("SupplierCode").getValue(),
				oModel = this.getView().getModel("oMdlSupplier"),
				aList = oModel.getProperty("/allsupplierwithopenap");

			aList.forEach(function (oRecord) {
				oRecord.selected = (oRecord.CardName === sInputValue);
			});
		},
		handleSearch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("CardName", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		handleValueHelpCloseSupplier: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var BPDetails = {};
			if (aContexts && aContexts.length) {
				BPDetails = aContexts.map(function (oContext) {
					var oBPDetails = {};
					oBPDetails.CardCode = oContext.getObject().CardCode;
					oBPDetails.CardName = oContext.getObject().CardName;
					return oBPDetails;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oMdlEditRecord.getData().EditRecord.SupplierCode = BPDetails[0].CardCode;
			this.oMdlEditRecord.getData().EditRecord.SupplierName = BPDetails[0].CardName;
			this.oMdlEditRecord.refresh();
		},
		//BP FRAGMENT -------------------
		//Batch Fragment
		handleValueHelpBatch: function () {
			if (!this._oValueHelpDialogs) {
				Fragment.load({
					name: "com.apptech.app-bankinteg.view.fragments.BatchDialogFragment",
					controller: this
				}).then(function (oValueHelpDialogs) {
					this._oValueHelpDialogs = oValueHelpDialogs;
					this.getView().addDependent(this._oValueHelpDialogs);
					this._configValueHelpDialogs();
					this._oValueHelpDialogs.open();
				}.bind(this));
			} else {
				this._configValueHelpDialogs();
				this._oValueHelpDialogs.open();
			}
		},
		_configValueHelpDialogs: function () {
			var sInputValue = this.byId("DocumentNo").getValue(),
				oModel = this.getView().getModel("oMdlBatch"),
				aList = oModel.getProperty("/allbatch");

			aList.forEach(function (oRecord) {
				oRecord.selected = (oRecord.U_App_DocNum === sInputValue);
			});
		},
		handleSearchBatch: function(oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("U_App_DocNum", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		handleValueHelpCloseBatch: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var BatchDetails = {};
			if (aContexts && aContexts.length) {
				BatchDetails = aContexts.map(function (oContext) {
					var oBatch = {};
					oBatch.U_App_DocNum = oContext.getObject().U_App_DocNum;
					oBatch.U_App_SupplierName = oContext.getObject().U_App_SupplierName;
					return oBatch;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.getView().byId("DocumentNo").setValue(BatchDetails[0].U_App_DocNum);
			// this.oMdlEditRecord.getData().EditRecord.SupplierName = BatchDetails[0].U_App_SupplierName;
			this.oMdlEditRecord.refresh();
		},
		//Batch Fragment---------------
		
		
		
		//End Updating
		prepareBatchRequestBody: function (oRequest,BatchUpdate) {

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
			
			var objectUDTUpdate = "";
			for (var ii = 0; ii < BatchUpdate.length; ii++) {

				objectUDTUpdate = BatchUpdate[ii];
				batchRequest = batchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
				batchRequest = batchRequest + "PATCH /b1s/v1/"  + objectUDTUpdate.tableName + "("+ objectUDTUpdate.docEntry +")";
				batchRequest = batchRequest + "\nContent-Type: application/json\n\n";
				batchRequest = batchRequest + JSON.stringify(objectUDTUpdate.data) + "\n\n";
			}

			batchRequest = batchRequest + endBatch;

			return batchRequest;

		},
		
		onView: function(oEvent){
			var iIndex = this.oTable.getSelectedIndex();
			var BatchNum = "";
			var Status = "";
			if (iIndex !== -1) {
				var oRowSelected = this.oTable.getBinding().getModel().getData().rows[this.oTable.getBinding().aIndices[iIndex]];
				BatchNum = oRowSelected.U_App_DocNum;
				Status = oRowSelected.U_App_Status;
			}
			
			var queryTag = "",value1 = "",value2 ="",value3="",value4 = "",dbName = "SBODEMOAU_SL";
			value1 = BatchNum;
			this.getSearchDataHead(dbName, "spAppBankIntegration", "getHeaderDat", value1, value2, value3, value4);
			this.getSearchDataDet(dbName, "spAppBankIntegration", "getBatch_Data", value1, value2, value3, value4);
			
			this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("Record Code : " + BatchNum + " [EDIT]");
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
			// this.onClearField();
			if (Status === "Draft"){
				this.getView().byId("DateFrom").setEnabled(true);
				this.getView().byId("DateTo").setEnabled(true);
				this.getView().byId("SupplierCode").setEnabled(true);
				this.getView().byId("searchID").setVisible(true);
				this.getView().byId("btnSave").setEnabled(true);
				this.getView().byId("btnDraft").setEnabled(true);
			}else{
				this.getView().byId("DateFrom").setEnabled(false);
				this.getView().byId("DateTo").setEnabled(false);
				this.getView().byId("SupplierCode").setEnabled(false);
				this.getView().byId("searchID").setVisible(false);
				this.getView().byId("btnSave").setEnabled(false);
				this.getView().byId("btnDraft").setEnabled(false);
			}
			
			
			// this.getView().byId("DocumentNo").setEnabled(true);
			// this.getView().byId("DateTagged").setValue(null);
			// this.getAllBatch();
			// this.oMdlBatch.refresh();

		},
		//Search
		onSearch: function(oEvent){
			
			var queryTag = "",value1 = "",value2 ="",value3="",value4 = "",dbName = "SBODEMOAU_SL";
			value1 = this.oMdlEditRecord.getData().EditRecord.DateFrom;
			 value2 = this.oMdlEditRecord.getData().EditRecord.DateTo;
			 value3 = this.oMdlEditRecord.getData().EditRecord.SupplierCode;
			 queryTag = "getFilteredData";
			 dbName = "SBODEMOAU_SL";
			//get all open AP base on parameters
			this.getSearchDataDet(dbName, "spAppBankIntegration", queryTag, value1, value2, value3, value4);
		}
		//search------------
		,
		//Generic selecting of data
		getSearchDataHead: function(dbName,procName,queryTag,value1,value2,value3,value4){
			//get all open AP base on parameters
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName="+ this.dataBase +"&procName="+ procName +"&QUERYTAG=" + queryTag
				+"&VALUE1="+ value1 +"&VALUE2="+ value2 +"&VALUE3="+ value3 +"&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
						sap.m.MessageToast.show(error);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					var oResult = JSON.stringify(results).replace("[", "").replace("]", "");
					this.oMdlEditRecord.setJSON("{\"EditRecord\" : " + oResult + "}");
					this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");
					this.oMdlEditRecord.refresh();
				}
			});
		},
		
		getSearchDataDet: function(dbName,procName,queryTag,value1,value2,value3,value4){
			this.oMdlAP = new sap.ui.model.json.JSONModel();
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName="+ this.dataBase +"&procName=spAppBankIntegration&QUERYTAG=" + queryTag
				+"&VALUE1="+ value1 +"&VALUE2="+ value2 +"&VALUE3="+ value3 +"&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					MessageToast.show(error);
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
		updateRecords: function(table,code,Data,batchNum){
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/"+table+"('"+code+"')",
				type: "PATCH",
				contentType: "application/json",
				data: Data, //If batch, body data should not be JSON.stringified
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {
					//this.oPage.setBusy(false);
					sap.m.MessageToast.show("Batch" + batchNum + "updated succesfully!");
				},
				context: this

			}).done(function (results) {
				if (results) {
					sap.m.MessageToast.show("Batch : " + batchNum + " updated succesfully!");
				}
			});
		},
		getTodaysDate: function () {
			var today = new Date();
			var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
			return date ;
		},
		onClearField: function () {
			try {
				this.oMdlEditRecord.getData().EditRecord.DateFrom = "";
				this.oMdlEditRecord.getData().EditRecord.DateTo = "";
				this.oMdlEditRecord.getData().EditRecord.SupplierCode = "";
				this.oMdlEditRecord.getData().EditRecord.SupplierName = "";
				this.oMdlEditRecord.getData().EditRecord.Remarks = "";
				// this.oMdlEditRecord.getData().EditRecord.DateTagged = "";
				this.getView().byId("DocumentNo").setValue("");
				this.getView().byId("Status").setValue("");
				this.oMdlEditRecord.refresh();
				
				
				
				this.oMdlAP.getData().allopenAP.length = 0;
				this.oMdlAP.refresh();
			} catch (err) {
				//console.log(err.message);
			}

		},
		onAddMode: function(){
			this.onClearField();
			this.getView().byId("DateFrom").setEnabled(true);
			this.getView().byId("DateTo").setEnabled(true);
			this.getView().byId("SupplierCode").setEnabled(true);
			this.getView().byId("DocumentNo").setEnabled(false);
			this.getView().byId("searchID").setVisible(true);
			this.getView().byId("DateTagged").setDateValue( new Date());
			
			this.getView().byId("btnSave").setEnabled(true);
			this.getView().byId("btnDraft").setEnabled(true);
			
			this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("RECORD [ADD]");
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
		},
		onAdd: function (oEvent) {
			// this.oPage.setBusy(true);
			//this.formMode = "Add";
			//Check if ther is selected line items
			var oTable = this.getView().byId("tblDetails");
			var selectedIndeices=oTable.getSelectedIndices();
			if(selectedIndeices.length === 0){
				sap.m.MessageToast.show("Please select line item/s!");
				return;
			}
			this.Status = "Draft";
			//Check if Existing
			this.deleteIfExisting();
			this.onAddProcess();
			// this.oPage.setBusy(false);
		},
		
		deleteIfExisting: function(){
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName="+ this.dataBase +"&procName=spAppBankIntegration&QUERYTAG=CheckIfExist"
				+ "&VALUE1=" + 	this.getView().byId("DocumentNo").getValue() + "&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				contentType: "application/json",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {
					//this.oPage.setBusy(false);
				},
				context: this
			}).done(function (results) {
				if (results) {
					
				}
			});
			
		},
		// deleteExistingH: function(){
		// 	$.ajax({
		// 		url: "/destinations/BiotechSL/b1s/v1/U_APP_OPPD('200206140929.60109')",
		// 		type: "DELETE",
		// 		contentType: "application/json",
		// 		error: function (xhr, status, error) {
		// 			//this.oPage.setBusy(false);
		// 			sap.m.MessageToast.show("Error");
		// 		},
		// 		success: function (json) {
		// 			//this.oPage.setBusy(false);
		// 		},
		// 		context: this
		// 	}).done(function (results) {
		// 		if (results) {
					
		// 		}
		// 	});
		// },
		onSave: function (oEvent) {
			var oTable = this.getView().byId("tblDetails");
			var selectedIndeices=oTable.getSelectedIndices();
			if(selectedIndeices.length === 0){
				sap.m.MessageToast.show("Please select line item/s!");
				return;
			}
			this.Status = "Saved";
			this.deleteIfExisting();
			this.onAddProcess();
		},
		onDeleteRow: function(oEvent){
			var oTable = this.getView().byId("tblDetails");
			// var myTableRows= oTable.getRows();
			var selectedIndeices=oTable.getSelectedIndices();
			var row;
			var count = 1;
			for (var i = 0; i < selectedIndeices.length; i++) {
					row = selectedIndeices[i];
					this.oMdlAP.getData().allopenAP.splice(selectedIndeices[row-count],1);
					count = count +1;
			}
			oTable.clearSelection();
			this.oMdlAP.refresh();
			
		},
		//Cancel Process
		onCancelTransaction: function(oEvent){
			var table= "";
			var code = "";
			var Data;
			var oT_PAYMENT_PROCESSING_H = {};
			//header
			table = "U_APP_OPPD";
			var batchNum = this.byId("DocumentNo").getValue();
			var remarks = this.byId("Remarks").getValue();
			code = this.oMdlEditRecord.getData().EditRecord.Code;
			oT_PAYMENT_PROCESSING_H.U_App_Status = "Cancelled";
			oT_PAYMENT_PROCESSING_H.U_App_Remarks = remarks;
			oT_PAYMENT_PROCESSING_H.U_App_UpdatedBy= this.userCode;
			oT_PAYMENT_PROCESSING_H.U_App_UpdatedDate = this.getTodaysDate();
			Data = JSON.stringify(oT_PAYMENT_PROCESSING_H);
			
			this.updateRecords(table, code, Data,batchNum);
			
		},
		//Cancel Process
		//Add Process----------------
		onAddProcess: function (oEvent) {
			var that = this;
			var CodeH = AppUI5.generateUDTCode("GetCode");
			// var DocNum = AppUI5.generateUDTCode("GetDocNum");
			var LastBatch = AppUI5.generateUDTCode("GetLastBatchOfDay");
			// if (LastBatch ==="0"){LastBatch =1;}
			var pad = "000";
			var result = (pad+LastBatch).slice(-pad.length);
			
			var today = new Date();
			var date = today.getFullYear() + '' + ("0" + (today.getMonth() + 1)).slice(-2) + '' + ("0" + today.getDate()).slice(-2);
			var hour = today.getHours()+''+today.getMinutes();
			var BatchCode = 'BFI' +date+''+hour+ '_' + result;
			
			
			//ON EDIT / ON SAVE RECORD OBJECT
			var oT_PAYMENT_PROCESSING_H = {};
			var oT_PAYMENT_PROCESSING_D = {};
			var oInvoice = {};
			
			
			oT_PAYMENT_PROCESSING_H.Code = CodeH;
			oT_PAYMENT_PROCESSING_H.Name = CodeH;
			oT_PAYMENT_PROCESSING_H.U_App_DocNum = BatchCode;
			oT_PAYMENT_PROCESSING_H.U_App_DateFrom = this.oMdlEditRecord.getData().EditRecord.DateFrom;
			oT_PAYMENT_PROCESSING_H.U_App_DateTo = this.oMdlEditRecord.getData().EditRecord.DateTo;
			oT_PAYMENT_PROCESSING_H.U_App_Suppliercode = this.oMdlEditRecord.getData().EditRecord.SupplierCode;
			oT_PAYMENT_PROCESSING_H.U_App_SupplierName = this.oMdlEditRecord.getData().EditRecord.SupplierName;
			oT_PAYMENT_PROCESSING_H.U_App_TaggingDate = this.getTodaysDate();//this.oMdlEditRecord.getData().EditRecord.DateTagged;
			oT_PAYMENT_PROCESSING_H.U_App_Status = this.Status;//this.oMdlEditRecord.getData().EditRecord.Status;
			oT_PAYMENT_PROCESSING_H.U_App_Remarks = this.oMdlEditRecord.getData().EditRecord.Remarks;
			oT_PAYMENT_PROCESSING_H.U_App_CreatedBy= this.userCode;
			oT_PAYMENT_PROCESSING_H.U_App_CreatedDate = this.getTodaysDate();
			// oT_PAYMENT_PROCESSING_H.U_App_UpdatedBy = "";
			// oT_PAYMENT_PROCESSING_H.U_App_UpdatedBy = "";
			
			var batchArray = [
				//directly insert data if data is single row per table 
				{
					"tableName": "U_APP_OPPD",
					"data": oT_PAYMENT_PROCESSING_H
				}
			];
			var d,i;
			var row;
			var code = "";
			var oTable = this.getView().byId("tblDetails");
			// var myTableRows= oTable.getRows();
			var selectedIndeices=oTable.getSelectedIndices();
			// var table = "";
			var BatchUpdate = [];
			for (d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
				for (i = 0; i < selectedIndeices.length; i++) {
					row = selectedIndeices[i];
					if (row === d) {
						var iLineNumDP = d + 1;
						//oT_PAYMENT_PROCESSING_D.O = "I";
						code = AppUI5.generateUDTCode("GetCode");
						oT_PAYMENT_PROCESSING_D.Code = code;
						oT_PAYMENT_PROCESSING_D.Name = code;
						oT_PAYMENT_PROCESSING_D.U_App_DocNum =  BatchCode;//this.oMdlEditRecord.getData().allopenAP[d].DocumentNo;
						oT_PAYMENT_PROCESSING_D.U_App_Priority = "";
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceDocType = this.oMdlAP.getData().allopenAP[d].InvoiceType;
						oT_PAYMENT_PROCESSING_D.U_App_InvDocNum = this.oMdlAP.getData().allopenAP[d].DocNum;
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceNo = this.oMdlAP.getData().allopenAP[d].DocEntry;
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceDate = this.oMdlAP.getData().allopenAP[d].DocDate;
						oT_PAYMENT_PROCESSING_D.U_App_CheckDate = this.oMdlAP.getData().allopenAP[d].DocDueDate;
						oT_PAYMENT_PROCESSING_D.U_App_SuppRefNo = this.oMdlAP.getData().allopenAP[d].NumAtCard;
						oT_PAYMENT_PROCESSING_D.U_App_Remarks = this.oMdlAP.getData().allopenAP[d].Comments;
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceType = this.oMdlAP.getData().allopenAP[d].DocType;
						oT_PAYMENT_PROCESSING_D.U_App_Desc = this.oMdlAP.getData().allopenAP[d].Dscription;
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceCur = this.oMdlAP.getData().allopenAP[d].DocCur;
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceTotal = this.oMdlAP.getData().allopenAP[d].DocTotal;
						oT_PAYMENT_PROCESSING_D.U_App_RemainingBal = this.oMdlAP.getData().allopenAP[d].RemainingBalance;
						oT_PAYMENT_PROCESSING_D.U_App_PaymentAmount = this.oMdlAP.getData().allopenAP[d].PaymentAmount;
						oT_PAYMENT_PROCESSING_D.U_App_CRANo = this.oMdlAP.getData().allopenAP[d].CRANo;
						oT_PAYMENT_PROCESSING_D.U_App_LineNumber = iLineNumDP;
						oT_PAYMENT_PROCESSING_D.U_App_CreatedBy= this.userCode;
						oT_PAYMENT_PROCESSING_D.U_App_CreatedDate = this.getTodaysDate();
						
						// oT_PAYMENT_PROCESSING_D.U_App_UpdatedBy = "";
						// oT_PAYMENT_PROCESSING_D.U_App_UpdatedBy = "";
						
						// oRecord.M_TERMS_TEMPLATE_D.push(JSON.parse(JSON.stringify(oT_TERMS_TEMP)));
						
						batchArray.push(JSON.parse(JSON.stringify(({
							"tableName": "U_APP_PPD1",
							"data": oT_PAYMENT_PROCESSING_D//AppUI5.generateUDTCode();
						}))));
						
						oInvoice.U_App_BatchNum = BatchCode;
						// if (this.oMdlAP.getData().allopenAP[d].InvoiceType === 'AP'){
						// 	table = "OPCH";
						// }else{
						// 	table = "ODPO";
						// }
						BatchUpdate.push(JSON.parse(JSON.stringify(({
							"tableName": (this.oMdlAP.getData().allopenAP[d].InvoiceType === 'AP' ? "PurchaseInvoices" : "PurchaseDownPayments"),
							"data": oInvoice,//AppUI5.generateUDTCode();,
							"docEntry": this.oMdlAP.getData().allopenAP[d].DocEntry//AppUI5.generateUDTCode();
						}))));
					
					}
				}
			}
			
			//array will be passed to function helper for constructing body text in request
			var sBodyRequest = this.prepareBatchRequestBody(batchArray,BatchUpdate);
			//ajax call to SL
			$.ajax({

				url: "https://18.136.35.41:50000/b1s/v1/$batch",
				type: "POST",
				contentType: "multipart/mixed;boundary=a",
				data: sBodyRequest,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {
					sap.m.MessageToast.show("Success saving Batch: " + BatchCode );
				},
				context: this

			}).done(function (results) {
				if (results) {
					this.getView().byId("DocumentNo").setValue(BatchCode);
					this.getView().byId("Status").setValue("Open");
					this.onClearField();
					this.oMdlBatch.refresh();
					that.prepareTable(false);
				}
			});
		
			
		},	
		// End Add process ----------------
		//Start Updating
		// onUpdateProcess: function(){
		// 	var table= "";
		// 	var code = "";
		// 	var Data;
		// 	var oT_PAYMENT_PROCESSING_H = {};
		// 	var oT_PAYMENT_PROCESSING_D = {};
		// 	//header
		// 	table = "U_APP_OPPD";
		// 	var batchNum = this.byId("DocumentNo").getValue();
		// 	var remarks = this.byId("Remarks").getValue();
		// 	code = this.oMdlEditRecord.getData().EditRecord.Code;
		// 	// oT_PAYMENT_PROCESSING_H.U_App_DocNum = batchNum;
		// 	// oT_PAYMENT_PROCESSING_H.U_App_DateFrom = this.oMdlEditRecord.getData().EditRecord.DateFrom;
		// 	// oT_PAYMENT_PROCESSING_H.U_App_DateTo = this.oMdlEditRecord.getData().EditRecord.DateTo;
		// 	// oT_PAYMENT_PROCESSING_H.U_App_Suppliercode = this.oMdlEditRecord.getData().EditRecord.SupplierCode;
		// 	// oT_PAYMENT_PROCESSING_H.U_App_SupplierName = this.oMdlEditRecord.getData().EditRecord.SupplierName;
		// 	// oT_PAYMENT_PROCESSING_H.U_App_TaggingDate = this.oMdlEditRecord.getData().EditRecord.DateTagged;
		// 	oT_PAYMENT_PROCESSING_H.U_App_Status = "P";
		// 	oT_PAYMENT_PROCESSING_H.U_App_Remarks = remarks;
		// 	oT_PAYMENT_PROCESSING_H.U_App_UpdatedBy= "manager";
		// 	oT_PAYMENT_PROCESSING_H.U_App_UpdatedDate = this.getTodaysDate();
		// 	Data = JSON.stringify(oT_PAYMENT_PROCESSING_H);
			
		// 	// var batchArray = [
		// 	// 	//directly insert data if data is single row per table 
		// 	// 	{
		// 	// 		"tableName": "U_APP_OPPD",
		// 	// 		"data": oT_PAYMENT_PROCESSING_H
		// 	// 	}
		// 	// ];
			
		// 	this.updateRecords(table, code, Data,batchNum);
		// 	//Deatails
		// 	var d,i;
		// 	var row;
		// 	var oTable = this.getView().byId("tblDetails");
		// 	// var myTableRows= oTable.getRows();
		// 	var selectedIndeices=oTable.getSelectedIndices();
		// 	table = "U_APP_PPD1";
		// 	for (d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
		// 		for (i = 0; i < selectedIndeices.length; i++) {
		// 			row = selectedIndeices[i];
		// 			if (row === d) {
		// 				var iLineNumDP = d + 1;
		// 				code = this.oMdlAP.getData().allopenAP[d].Code;
		// 				oT_PAYMENT_PROCESSING_D.U_App_DocNum = batchNum;
		// 				oT_PAYMENT_PROCESSING_D.U_App_Priority = this.oMdlAP.getData().allopenAP[d].Priority;
		// 				oT_PAYMENT_PROCESSING_D.U_App_InvoiceNo = this.oMdlAP.getData().allopenAP[d].DocNum;
		// 				oT_PAYMENT_PROCESSING_D.U_App_InvoiceDate = this.oMdlAP.getData().allopenAP[d].DocDate;
		// 				oT_PAYMENT_PROCESSING_D.U_App_CheckDate = this.oMdlAP.getData().allopenAP[d].DocDueDate;
		// 				oT_PAYMENT_PROCESSING_D.U_App_SuppRefNo = this.oMdlAP.getData().allopenAP[d].NumAtCard;
		// 				oT_PAYMENT_PROCESSING_D.U_App_Remarks = this.oMdlAP.getData().allopenAP[d].Comments;
		// 				oT_PAYMENT_PROCESSING_D.U_App_InvoiceType = this.oMdlAP.getData().allopenAP[d].DocType;
		// 				oT_PAYMENT_PROCESSING_D.U_App_Desc = this.oMdlAP.getData().allopenAP[d].Dscription;
		// 				oT_PAYMENT_PROCESSING_D.U_App_InvoiceCur = this.oMdlAP.getData().allopenAP[d].DocCur;
		// 				oT_PAYMENT_PROCESSING_D.U_App_InvoiceTotal = this.oMdlAP.getData().allopenAP[d].DocTotal;
		// 				oT_PAYMENT_PROCESSING_D.U_App_RemainingBal = this.oMdlAP.getData().allopenAP[d].OpenSum;
		// 				oT_PAYMENT_PROCESSING_D.U_App_PaymentAmount = this.oMdlAP.getData().allopenAP[d].PaymentAmount;
		// 				oT_PAYMENT_PROCESSING_D.U_App_CRANo = this.oMdlAP.getData().allopenAP[d].CRANo;
		// 				oT_PAYMENT_PROCESSING_D.U_App_LineNumber = iLineNumDP;
		// 				oT_PAYMENT_PROCESSING_D.U_App_UpdatedBy= "manager";
		// 				oT_PAYMENT_PROCESSING_D.U_App_UpdatedDate = this.getTodaysDate();
						
		// 				// batchArray.push(JSON.parse(JSON.stringify(({
		// 				// 	"tableName": "U_APP_PPD1",
		// 				// 	"data": oT_PAYMENT_PROCESSING_D//this.generateUDTCode();
		// 				// }))));

		// 				Data = JSON.stringify(oT_PAYMENT_PROCESSING_D);
		// 				try{
		// 					this.updateRecords(table, code, Data,batchNum);
		// 				} catch (err) {
		// 					//console.log(err.message);
		// 				}
		// 			}
		// 		}
		// 	}
		// 	// //array will be passed to function helper for constructing body text in request
		// 	// var sBodyRequest = this.prepareBatchRequestBody(batchArray,"PATCH");
		// 	// //ajax call to SL
		// 	// $.ajax({

		// 	// 	url: "/destinations/BiotechSL/b1s/v1/$batch",
		// 	// 	type: "PATCH",
		// 	// 	contentType: "multipart/mixed;boundary=a",
		// 	// 	data: sBodyRequest, //If batch, body data should not be JSON.stringified
		// 	// 	xhrFields: {
		// 	// 		withCredentials: true
		// 	// 	},
		// 	// 	error: function (xhr, status, error) {
		// 	// 		//this.oPage.setBusy(false);
		// 	// 		sap.m.MessageToast.show("Error");
		// 	// 	},
		// 	// 	success: function (json) {
		// 	// 		//this.oPage.setBusy(false);
		// 	// 		sap.m.MessageToast.show("Success UpDated Batch: " + batchNum );
		// 	// 	},
		// 	// 	context: this

		// 	// }).done(function (results) {
		// 	// 	if (results) {
		// 	// 		// this.getView().byId("DocumentNo").setValue(batchNum);
		// 	// 		// this.getView().byId("Status").setValue("Open");
		// 	// 		// this.onClearField();
		// 	// 		// this.oMdlBatch.refresh();
		// 	// 	}
		// 	// });
		// }
		
	});

});
