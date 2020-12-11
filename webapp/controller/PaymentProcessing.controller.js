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
			this.fPrepareTable(false,"");
			this.oMdlAllRecord.refresh();
		},

		onInit: function () {
			//get DataBase loggedin
			this.sDataBase = jQuery.sap.storage.Storage.get("dataBase");	
			this.sUserCode = jQuery.sap.storage.Storage.get("userCode");

			var route = this.getOwnerComponent().getRouter().getRoute("PaymentProcessing");
     		route.attachPatternMatched(this.onRoutePatternMatched,this);
			
			this.oMdlEditRecord = new JSONModel("model/paymentprocessing.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");

			this.oMdlAP = new JSONModel("model/paymentprocessing.json");
			this.getView().setModel(this.oMdlAP, "oMdlAP");
			//document status
			this.oMdlDocStat = new JSONModel("model/documentstatus.json");
			this.getView().setModel(this.oMdlDocStat, "oMdlDocStat");
			this.oTableDetails = this.getView().byId("tblDetails");
			//set Tagging Date to current date
			this.getView().byId("DateTagged").setDateValue( new Date());
			//For Status
			this.sStatus = "";

			//get Buttons
			this.oMdlButtons = new JSONModel();
			this.oResults = AppUI5.fGetButtons(this.sDataBase,this.sUserCode,"paymentprocessing");
			var newresult = [];
				this.oResults.forEach((e)=> {
					var d = {};
					d[e.U_ActionDesc] = JSON.parse(e.visible);
					newresult.push(JSON.parse(JSON.stringify(d)));
				});
			var modelresult = JSON.parse("{" + JSON.stringify(newresult).replace(/{/g,"").replace(/}/g,"").replace("[","").replace("]","") + "}");
			this.oMdlButtons.setJSON("{\"buttons\" : " + JSON.stringify(modelresult) + "}");
			this.getView().setModel(this.oMdlButtons, "buttons"); 
			
			
			//CREATING MODEL SUPPLIER WITH OPEN AP
			this.oMdlSupplier = new JSONModel();
			this.fGetAllSupplier();
			//CREATING MODEL SUPPLIER WITH OPEN AP---------------------
			//GET ALL BATCHCODE
			this.oMdlBatch = new JSONModel();
			this.fGetAllBatch();
			
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
			this.oTable.getColumns()[3].setFilterProperty("U_App_Status");
			this.oTable.getColumns()[4].setLabel("Remarks");
			this.oTable.getColumns()[5].setLabel("Created Date");
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
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName="+ this.sDataBase +"&procName=spAppBankIntegration&QUERYTAG=getAllRecord&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
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
					aReturnResult = results;
				}
			});
			return aReturnResult;

		},
		//GET ALL BATCHCODE----------------
		//CREATING MODEL SUPPLIER WITH OPEN AP
		fGetAllSupplier: function(){
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName="+ this.sDataBase +"&procName=spAppBankIntegration&QUERYTAG=getAllBPwithOpenAP&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
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
		fPrepareBatchRequestBody: function (oRequest,oRequestUpdate,oRequestDelete) {

			var batchRequest = "";

			var beginBatch = "--a\nContent-Type: multipart/mixed;boundary=b\n\n";
			var endBatch = "--b--\n--a--";

			batchRequest = batchRequest + beginBatch;
			
			if (oRequestDelete !== 0){
				var objectUDTDelete = "";
				for (var i = 0; i < oRequestDelete.length; i++) {

					objectUDTDelete = oRequestDelete[i];
					batchRequest = batchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
					batchRequest = batchRequest + "DELETE /b1s/v1/" + objectUDTDelete.tableName +"('"+ objectUDTDelete.data +"')\n";
				}
			}
			
			var objectUDT = "";
			for (var i = 0; i < oRequest.length; i++) {

				objectUDT = oRequest[i];
				batchRequest = batchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
				batchRequest = batchRequest + "POST /b1s/v1/" + objectUDT.tableName;
				batchRequest = batchRequest + "\nContent-Type: application/json\n\n";
				batchRequest = batchRequest + JSON.stringify(objectUDT.data) + "\n\n";
			}
			
			var objectUDTUpdate = "";
			for (var ii = 0; ii < oRequestUpdate.length; ii++) {

				objectUDTUpdate = oRequestUpdate[ii];
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
			// this.onCleaClearField();
			// this.getView().byId("btnPrint").setVisible(true);
			// this.getView().byId("btnCancel").setVisible(true);
			if (sStatus === "Draft" || sStatus === "Rejected"){
				this.getView().byId("DateFrom").setEnabled(true);
				this.getView().byId("DateTo").setEnabled(true);
				this.getView().byId("SupplierCode").setEnabled(true);
				//this.getView().byId("searchID").setVisible(true);
				this.getView().byId("btnSave").setEnabled(true);
				this.getView().byId("btnDraft").setEnabled(true);
				this.getView().byId("btnCancel").setEnabled(false);
				this.getView().byId("btnDeleteRow").setEnabled(true);
			}else if(sStatus === "Approved"){
				this.getView().byId("DateFrom").setEnabled(false);
				this.getView().byId("DateTo").setEnabled(false);
				this.getView().byId("SupplierCode").setEnabled(false);
				// this.getView().byId("searchID").setVisible(false);
				this.getView().byId("btnSave").setEnabled(false);
				this.getView().byId("btnDraft").setEnabled(false);
				this.getView().byId("btnCancel").setEnabled(false);
			}else if(sStatus === "Saved"){
				this.getView().byId("DateFrom").setEnabled(false);
				this.getView().byId("DateTo").setEnabled(false);
				this.getView().byId("SupplierCode").setEnabled(false);
				this.getView().byId("searchID").setVisible(false);
				this.getView().byId("btnSave").setEnabled(false);
				this.getView().byId("btnDraft").setEnabled(false);
				this.getView().byId("btnCancel").setEnabled(true);
				this.getView().byId("btnDeleteRow").setEnabled(false);
				this.getView().byId("Remarks").setEnabled(false);
				this.getView().byId("btnCancel").setEnabled(true);
			}else{
				this.getView().byId("DateFrom").setEnabled(false);
				this.getView().byId("DateTo").setEnabled(false);
				this.getView().byId("SupplierCode").setEnabled(false);
				this.getView().byId("searchID").setVisible(false);
				this.getView().byId("btnSave").setEnabled(false);
				this.getView().byId("btnDraft").setEnabled(false);
				this.getView().byId("btnCancel").setEnabled(true);
				this.getView().byId("btnDeleteRow").setEnabled(false);
				this.getView().byId("Remarks").setEnabled(false);
				this.getView().byId("btnCancel").setEnabled(false);

			}

			

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
		},
		//search------------
		onChangePayment: function(){
			// var testing = this.getView().byId("BAmount").getValue();
			// console.log(testing);
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
					var oResult = JSON.stringify(results).replace("[", "").replace("]", "");
					this.oMdlEditRecord.setJSON("{\"EditRecord\" : " + oResult + "}");
					this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");
					this.oMdlEditRecord.refresh();
				}
			});
		},
		
		getSearchDataDet: function(dbName,procName,queryTag,value1,value2,value3,value4){
			//this.oMdlAP = new sap.ui.model.json.JSONModel();
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
		updateRecords: function(table,code,Data,batchNum){
			$.ajax({
				url: "https://sl.biotechfarms.net/b1s/v1/"+table+"('"+ code +"')",
				type: "PATCH",
				contentType: "application/json",
				async: false,
				data: Data, //If batch, body data should not be JSON.stringified
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var oMessage = xhr.responseJSON["error"].message.value;	
					AppUI5.fErrorLogs(table,"Update Batch","null","null",oMessage,"Update",this.sUserCode,"null",Data);		
					sap.m.MessageToast.show(oMessage);
					console.error(Message);
					//console.error(xhr);
				},
				success: function (json) {
					//this.oPage.setBusy(false);
					sap.m.MessageToast.show("Batch : " + batchNum + " cancelled!");
					this.fPrepareTable(false);
					this.oMdlAllRecord.refresh();
				},
				context: this

			}).done(function (results) {
				if (results) {
					sap.m.MessageToast.show("Batch : " + batchNum + " cancelled!");
					this.fPrepareTable(false);
					this.oMdlAllRecord.refresh();
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
			// this.getView().byId("btnPrint").setVisible(false);
			// this.getView().byId("btnCancel").setVisible(false);
			
			this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("TRANSACTION [ADD]");
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
		},
		fVAlidate: function(){
			//Check if ther is selected line items
			if (this.getView().byId("SupplierCode").getValue() === "") {
				MessageToast.show("Please choose Supplier!");
				return false;
			}	
			var oTable = this.getView().byId("tblDetails");
			var selectedIndeices=oTable.getSelectedIndices();
			if(selectedIndeices.length === 0){
				sap.m.MessageToast.show("Please select line item/s!");
				return false;
			}
			return true;
		},
		onAdd: function (oEvent) {
			this.getView().byId("btnDraft").setEnabled(false);
			if(!this.fVAlidate()){
				this.getView().byId("btnDraft").setEnabled(true);
				return false;
			}
			AppUI5.fShowBusyIndicator(10000);
			this.sStatus = "Draft";
			//Check if Existing
			//this.deleteIfExisting();
			this.onAddProcess();
			AppUI5.fHideBusyIndicator();
			this.getView().byId("btnDraft").setEnabled(true);
		},
		
		deleteIfExisting: function(){
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName="+ this.sDataBase +"&procName=spAppBankIntegration&QUERYTAG=CheckIfExist"
				+ "&VALUE1=" + 	this.getView().byId("DocumentNo").getValue() + "&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				contentType: "application/json",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					AppUI5.fHideBusyIndicator();
					console.error(Message);
				},
				success: function (json) {
				},
				context: this
			}).done(function (results) {
				if (results) {
					
				}
			});
			
		},
		CheckIfExisting: function(queryTag,value1){
			var HeaderCode = "";
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName="+ this.sDataBase +"&procName=spAppBankIntegration&QUERYTAG=" + queryTag
				+"&VALUE1="+ value1 +"&VALUE2=&VALUE3=&VALUE4=",
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
					if (results.length === 0){
						return HeaderCode = 0;
					}
					if (queryTag === 'CheckIfExistingHeader'){
						// this.oMdlExistingHeader.setJSON("{\"ExistingHeader\" : " + JSON.stringify(results) + "}");
						// this.getView().setModel(this.oMdlExistingHeader, "oMdlExistingHeader");
						HeaderCode = results[0].Code; 

						return HeaderCode;
					}else{
						this.oMdlExistingDetails.setJSON("{\"ExistingDetails\" : " + JSON.stringify(results) + "}");
						this.getView().setModel(this.oMdlExistingDetails, "oMdlExistingDetails");
					}
				}
			});
			return HeaderCode;
		},
		onSave: function (oEvent) {
			this.getView().byId("btnSave").setEnabled(false);
			if(!this.fVAlidate){
				this.getView().byId("btnSave").setEnabled(true);
				return false;
			}
			AppUI5.fShowBusyIndicator(10000);
			this.sStatus = "Saved";
			this.onAddProcess();
			AppUI5.fHideBusyIndicator();
			this.getView().byId("btnSave").setEnabled(true);
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
			AppUI5.fShowBusyIndicator(4000);
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
			oT_PAYMENT_PROCESSING_H.U_App_UpdatedBy= this.sUserCode;
			oT_PAYMENT_PROCESSING_H.U_App_UpdatedDate = this.getTodaysDate();
			Data = JSON.stringify(oT_PAYMENT_PROCESSING_H);
			
			this.updateRecords(table, code, Data,batchNum);
			AppUI5.fHideBusyIndicator();
			
		},
		//Cancel Process
		//Add Process----------------
		onAddProcess: function (oEvent) {
			//Get data if existing
			//header
			//Skip delete if status is rejected
			if(this.getView().byId("Status").getValue() !== "Rejected" ){
				var aHeaderCode = this.CheckIfExisting("CheckIfExistingHeader",this.getView().byId("DocumentNo").getValue());
				//If Newly add Skip Delete
				if (aHeaderCode !== 0){
					//details
					this.CheckIfExisting("CheckIfExistingDetails",this.getView().byId("DocumentNo").getValue());
					//Compose for Delete
					var aBatchDelete = [
						{
							"tableName": "U_APP_OPPD",
							"data": aHeaderCode
						}
					];
					for (var d = 0; d < this.oMdlExistingDetails.getData().ExistingDetails.length; d++) {
						aBatchDelete.push(JSON.parse(JSON.stringify(({
							"tableName": "U_APP_PPD1",
							"data": this.oMdlExistingDetails.getData().ExistingDetails[d].Code
						}))));
					}
				}else{
					var aBatchDelete = 0
				}
			}else{var aBatchDelete = 0}
			
			//End delete
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

			var sTableName = "";
			
			
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
			oT_PAYMENT_PROCESSING_H.U_App_Status = this.sStatus;//this.oMdlEditRecord.getData().EditRecord.Status;
			oT_PAYMENT_PROCESSING_H.U_App_Remarks = this.oMdlEditRecord.getData().EditRecord.Remarks;
			oT_PAYMENT_PROCESSING_H.U_App_CreatedBy= this.sUserCode;
			oT_PAYMENT_PROCESSING_H.U_App_CreatedDate = this.getTodaysDate();
			oT_PAYMENT_PROCESSING_H.U_App_DraftReference = (this.getView().byId("DocumentNo").getValue() === null ? "" : this.getView().byId("DocumentNo").getValue());
			// oT_PAYMENT_PROCESSING_H.U_App_UpdatedBy = "";
			// oT_PAYMENT_PROCESSING_H.U_App_UpdatedBy = "";
			
			var aBatch = [
				//directly insert data if data is single row per table 
				{
					"tableName": "U_APP_OPPD",
					"data": oT_PAYMENT_PROCESSING_H
				}
			];
			var iCounter,iCounter2;
			var iRow;
			var iCode = "";
			var oTable = this.getView().byId("tblDetails");
			var selectedIndeices=oTable.getSelectedIndices();
			var aBatchUpdate = [];
			for (iCounter = 0; iCounter < this.oMdlAP.getData().allopenAP.length; iCounter++) {
				for (iCounter2 = 0; iCounter2 < selectedIndeices.length; iCounter2++) {
					iRow = selectedIndeices[iCounter2];
					if (iRow === iCounter) {
						var iLineNumDP = iCounter + 1;
						iCode = AppUI5.generateUDTCode("GetCode");
						if(this.CheckIfExisting("CheckIfExistingInvoice",this.oMdlAP.getData().allopenAP[iCounter].DocNum)>0){
							sap.m.MessageToast.show("Invoice" + this.oMdlAP.getData().allopenAP[iCounter].DocNum + "already added in batch!");
							return;
						}
						oT_PAYMENT_PROCESSING_D.Code = iCode;
						oT_PAYMENT_PROCESSING_D.Name = iCode;
						oT_PAYMENT_PROCESSING_D.U_App_DocNum =  BatchCode;//this.oMdlEditRecord.getData().allopenAP[d].DocumentNo;
						oT_PAYMENT_PROCESSING_D.U_App_Priority = this.oMdlAP.getData().allopenAP[iCounter].Priority;
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceDocType = this.oMdlAP.getData().allopenAP[iCounter].InvoiceType;
						oT_PAYMENT_PROCESSING_D.U_App_InvDocNum = this.oMdlAP.getData().allopenAP[iCounter].DocNum;
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceNo = this.oMdlAP.getData().allopenAP[iCounter].DocEntry;
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceDate = this.oMdlAP.getData().allopenAP[iCounter].DocDate;
						oT_PAYMENT_PROCESSING_D.U_App_CheckDate = this.oMdlAP.getData().allopenAP[iCounter].DocDueDate;
						oT_PAYMENT_PROCESSING_D.U_App_SuppRefNo = this.oMdlAP.getData().allopenAP[iCounter].NumAtCard;
						oT_PAYMENT_PROCESSING_D.U_App_Remarks = this.oMdlAP.getData().allopenAP[iCounter].Comments;
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceType = this.oMdlAP.getData().allopenAP[iCounter].DocType;
						oT_PAYMENT_PROCESSING_D.U_App_Desc = this.oMdlAP.getData().allopenAP[iCounter].Dscription;
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceCur = this.oMdlAP.getData().allopenAP[iCounter].DocCur;
						oT_PAYMENT_PROCESSING_D.U_App_InvoiceTotal = this.oMdlAP.getData().allopenAP[iCounter].DocTotal;
						if(this.oMdlAP.getData().allopenAP[iCounter].DocTotal > this.oMdlAP.getData().allopenAP[iCounter].PaymentAmount){
							sap.m.MessageToast.show("Amount is greater than Invoice Amount!");
							return;
						}
						oT_PAYMENT_PROCESSING_D.U_App_RemainingBal = this.oMdlAP.getData().allopenAP[iCounter].RemainingBalance;
						oT_PAYMENT_PROCESSING_D.U_App_PaymentAmount = this.oMdlAP.getData().allopenAP[iCounter].PaymentAmount;
						oT_PAYMENT_PROCESSING_D.U_App_CRANo = this.oMdlAP.getData().allopenAP[iCounter].CRANo;
						oT_PAYMENT_PROCESSING_D.U_App_LineNumber = iLineNumDP;
						oT_PAYMENT_PROCESSING_D.U_App_CreatedBy= this.sUserCode;
						oT_PAYMENT_PROCESSING_D.U_App_CreatedDate = this.getTodaysDate();
						oT_PAYMENT_PROCESSING_D.U_App_DraftReference = (this.getView().byId("DocumentNo").getValue() === null ? "" : this.getView().byId("DocumentNo").getValue());
						oT_PAYMENT_PROCESSING_D.U_App_WTax = this.oMdlAP.getData().allopenAP[iCounter].WTaxAmount;
						oT_PAYMENT_PROCESSING_D.U_App_Tax = this.oMdlAP.getData().allopenAP[iCounter].TaxAmount;
						oT_PAYMENT_PROCESSING_D.U_App_WTaxRate = this.oMdlAP.getData().allopenAP[iCounter].Rate;
						oT_PAYMENT_PROCESSING_D.U_App_TaxCode = this.oMdlAP.getData().allopenAP[iCounter].TaxCode;
						aBatch.push(JSON.parse(JSON.stringify(({
							"tableName": "U_APP_PPD1",
							"data": oT_PAYMENT_PROCESSING_D//AppUI5.generateUDTCode();
						}))));
						
						oInvoice.U_App_BatchNum = BatchCode;
						if(this.oMdlAP.getData().allopenAP[iCounter].InvoiceType === 'AP'){
							sTableName = "PurchaseInvoices";
						}else if(this.oMdlAP.getData().allopenAP[iCounter].InvoiceType === 'APDP'){
							sTableName = "PurchaseDownPayments";
						}else{
							sTableName = "PurchaseCreditNotes";
						}
						aBatchUpdate.push(JSON.parse(JSON.stringify(({
							"tableName": sTableName,
							"data": oInvoice,//AppUI5.generateUDTCode();,
							"docEntry": this.oMdlAP.getData().allopenAP[iCounter].DocEntry//AppUI5.generateUDTCode();
						}))));
					
					}
				}
			}
			
			//array will be passed to function helper for constructing body text in request
			var sBodyRequest = this.fPrepareBatchRequestBody(aBatch,aBatchUpdate,aBatchDelete);
			//ajax call to SL
			$.ajax({

				url: "https://sl.biotechfarms.net/b1s/v1/$batch",
				type: "POST",
				contentType: "multipart/mixed;boundary=a",
				data: sBodyRequest,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					// var Message = xhr.responseJSON["error"].message.value;			
					// sap.m.MessageToast.show(Message);
					// AppUI5.fHideBusyIndicator();
					// console.error(Message);
					AppUI5.fHideBusyIndicator();
				},
				success: function (json) {
					sap.m.MessageToast.show("Success saving Batch: " + BatchCode );
				},
				context: this

			}).done(function (results) {
				if(JSON.stringify(results).search("400 Bad") !== -1) {
					var oStartIndex = results.search("value") + 10;
					var oEndIndex = results.indexOf("}") - 8;
					var oMessage = results.substring(oStartIndex,oEndIndex);
					AppUI5.fErrorLogs("U_APP_OPPD,U_APP_PPD1","Add Batch","null","null",oMessage,"Insert",this.sUserCode,"null",sBodyRequest);
					sap.m.MessageToast.show(oMessage);
					console.error(oMessage);
					AppUI5.fHideBusyIndicator();
				}else{
					if (results) {
						this.getView().byId("DocumentNo").setValue(BatchCode);
						this.getView().byId("Status").setValue("Open");
						this.onClearField();
						this.oMdlBatch.refresh();
						that.fPrepareTable(false);
						this.oMdlAllRecord.refresh();
					}
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
