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
	"sap/m/MessageBox",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function (Controller, JSONModel, MessageToast, Filter, FilterOperator, AppUI5, Fragment,
	 Dialog, ButtonType, Button, Text, MessageBox, Export, ExportTypeCSV) {
	"use strict";

	return Controller.extend("com.apptech.app-bankinteg.controller.PaymentFileExtraction", {
		onRoutePatternMatched: function (event) {
			document.title = "BFI BANKINTEG";
			//refresh main table
			this.fPrepareTable(false);
			this.oMdlAllRecord.refresh();

			//refresh batch list
			this.fGetRecords("getAllSavedBatch", "Batch");
			this.oMdlBatch.refresh();
		},

		onInit: function () {
			//get DataBase loggedin
			this.sDataBase = jQuery.sap.storage.Storage.get("dataBase");
			this.sUserCode = jQuery.sap.storage.Storage.get("userCode");

			var oModelProd = new JSONModel("model/record.json");
			this.getView().setModel(oModelProd);

			var route = this.getOwnerComponent().getRouter().getRoute("PaymentFileExtraction");
     		route.attachPatternMatched(this.onRoutePatternMatched,this);

			//getButtons
			this.oMdlButtons = new JSONModel();
			this.oResults = AppUI5.fGetButtons(this.sDataBase,this.sUserCode,"paymentfileextraction");
			var newresult = [];
				this.oResults.forEach((e)=> {
					var d = {};
					d[e.U_ActionDesc] = JSON.parse(e.visible);
					newresult.push(JSON.parse(JSON.stringify(d)));
				});
			var modelresult = JSON.parse("{" + JSON.stringify(newresult).replace(/{/g,"").replace(/}/g,"").replace("[","").replace("]","") + "}");
			this.oMdlButtons.setJSON("{\"buttons\" : " + JSON.stringify(modelresult) + "}");
			this.getView().setModel(this.oMdlButtons, "buttons");

			this.oExport = new JSONModel();
			this.oMdlLineNum = new JSONModel();
			// this.oMdlBank.setJSON("{\"allpnbbank\" : " + JSON.stringify(results) + "}");
			// this.getView().setModel(this.oMdlBank, "oMdlBank");

			this.oMdlPayExtract = new JSONModel("model/paymentfileextraction.json");
			this.getView().setModel(this.oMdlPayExtract, "oMdlPayExtract");

			this.oMdlAP = new JSONModel("model/paymentfileextraction.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlAP");

			this.oMdlEditRecord = new JSONModel("model/paymentfileextraction.json");
			this.getView().setModel(this.oMdlEditRecord, "oMdlEditRecord");
			// //CREATING MODEL SUPPLIER WITH OPEN AP---------------------
			//GET ALL BATCHCODE
			this.oMdlBatch = new JSONModel();
			this.fGetRecords("getAllSavedBatch", "Batch");
			//CREATING MODEL SUPPLIER WITH OPEN AP
			this.oMdlBank = new JSONModel();
			this.fGetRecords("getAllBank", "Bank");
			//CREATING MODEL SUPPLIER WITH OPEN AP---------------------
			this.iDocEntry = 0;
			this.sBatchNumber = "";

			this.oMdlBPInfo = new JSONModel();
			// this.oMdlFileExport = new JSONModel();

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
		//TABLE VIEW--------------------------------
		fPrepareTable: function (bIsInit) {

			var aResults = this.fGetTableData("getAllSaveDrafts");

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
					this.rRenameColumns();
				}

			}

		},
		rRenameColumns: function () {
			this.oTable.getColumns()[0].setLabel("Batch Number");
			this.oTable.getColumns()[0].setFilterProperty("U_App_DocNum");
			this.oTable.getColumns()[1].setLabel("Draft No.");
			this.oTable.getColumns()[2].setLabel("Status");
			this.oTable.getColumns()[3].setLabel("Created Date");
			this.oTable.getColumns()[3].setFilterProperty("U_App_CreatedDate");
		},

		filterGlobally : function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;

			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("U_App_DocNum", FilterOperator.Contains, sQuery),
					new Filter("U_App_DraftNo", FilterOperator.Contains, sQuery),
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
		fGetRecords: function (queryTag, sRecord) {
			// var aReturnResult = [];
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName=" + this.sDataBase + "&procName=spAppBankIntegration&QUERYTAG=" + queryTag +
					"&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					//MessageToast.show(error);
					if (xhr.status === 400) {
						sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
						sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
					} else {
						var Message = xhr.responseJSON["error"].message.value;			
						sap.m.MessageToast.show(Message);
					}
					console.error(xhr.responseJSON["error"].message.value);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					if (sRecord === "Batch") {
						this.oMdlBatch.setJSON("{\"allbatch\" : " + JSON.stringify(results) + "}");
						this.getView().setModel(this.oMdlBatch, "oMdlBatch");
					} else {
						this.oMdlBank.setJSON("{\"allpnbbank\" : " + JSON.stringify(results) + "}");
						this.getView().setModel(this.oMdlBank, "oMdlBank");
					}
				}
			});
		},
		fGetTableData: function (queryTag) {
			var aReturnResult = [];
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName=" + this.sDataBase + "&procName=spAppBankIntegration&QUERYTAG=" + queryTag +
					"&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					aReturnResult = [];
					if (xhr.status === 400) {
						sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
						sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
					} else {
						var Message = xhr.responseJSON["error"].message.value;			
						sap.m.MessageToast.show(Message);
					}
					console.error(xhr.responseJSON["error"].message.value);
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
		onClickAdd: function (oEvent) {
			this.fClearFields();
		},
		fClearFields: function () {
			try {
				// this.getView().byId("btnSearch").setVisible(true);
				this.getView().byId("btnPostDraft").setEnabled(true);
				this.getView().byId("btnExport").setEnabled(false);

				this.oMdlPayExtract.getData().EditRecord.DRAFTNO = "";
				this.oMdlPayExtract.getData().EditRecord.DOCNUM = "";
				this.oMdlPayExtract.getData().EditRecord.PRINTINGBRANCH = "";
				this.oMdlPayExtract.getData().EditRecord.DISTPATCHTO = "";
				this.oMdlPayExtract.getData().EditRecord.DISTPATCHTOCODE = "";
				this.oMdlPayExtract.getData().EditRecord.DISTPATCHTONAME = "";
				this.oMdlPayExtract.getData().EditRecord.PNBACCOUNTNO = "";
				this.oMdlPayExtract.getData().EditRecord.PNBACCOUNTNAME = "";
				this.oMdlPayExtract.getData().EditRecord.REMARKS = "";
				this.oMdlPayExtract.refresh();

				this.getView().byId("DocumentNo").setEnabled(true);
				this.getView().byId("PrintingBranch").setEnabled(true);
				this.getView().byId("DispatchTo").setEnabled(true);
				this.getView().byId("DispatchToCode").setEnabled(true);
				this.getView().byId("PNBAccountNo").setEnabled(true);
				
				this.getView().byId("btnCancel").setEnabled(false);
				this.getView().byId("btnSaveAsDraft").setEnabled(true);

				this.oMdlAP.getData().allopenAP.length = 0;
				this.oMdlAP.refresh();

				this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("TRANSACTION [ADD]");
				var tab = this.getView().byId("idIconTabBarInlineMode");
				tab.setSelectedKey("tab2");

				this.bIsAdd = "A";
			} catch (err) {
				//console.log(err.message);
			}

		},
		onClickEdit: function (oEvent) {
			var iIndex = this.oTable.getSelectedIndex();
			//var sQueryTable = "M_TERMS_TEMPLATE";
			var sDraftNum = "";
			var sBatchNum = "";
			if (iIndex !== -1) {
				var oRowSelected = this.oTable.getBinding().getModel().getData().rows[this.oTable.getBinding().aIndices[iIndex]];
				sDraftNum = (oRowSelected.U_App_DraftNo === null ? null : oRowSelected.U_App_DraftNo)

				sBatchNum = oRowSelected.U_App_DocNum;
				sBatchNum = sBatchNum.split(',');
				sBatchNum = JSON.stringify(sBatchNum).replace("[", "").replace("]", "").replace(" ", "").replace(/"/g, "'");
				sBatchNum = sBatchNum.replace(" ", "");

				//AJAX selected Key
				$.ajax({
					url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName=" + this.sDataBase + "&procName=spAppBankIntegration&QUERYTAG=getSpecificDraft" +
						"&VALUE1=" + sDraftNum + "&VALUE2=&VALUE3=&VALUE4=",
					type: "GET",
					async: false,
					dataType: "json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
					},
					error: function (xhr, status, error) {
						//MessageToast.show(error);
						if (xhr.status === 400) {
							sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
							sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
						} else {
							var Message = xhr.responseJSON["error"].message.value;			
							sap.m.MessageToast.show(Message);
						}
						console.error(xhr.responseJSON["error"].message.value);
					},
					success: function (json) {},
					context: this
				}).done(function (results) {
					if (results.length <= 0) {
						return;
					}
					var oResult = JSON.stringify(results).replace("[", "").replace("]", "");
					this.oMdlPayExtract.setJSON("{\"EditRecord\" : " + oResult + "}");
					this.getView().setModel(this.oMdlPayExtract, "oMdlPayExtract");
					this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("TRANSACTION Code : " + this.oMdlPayExtract.getData().EditRecord
						.DOCENTRY + " [EDIT]");
				});

				var queryTag = "",
					value1 = "",
					value2 = "",
					value3 = "",
					value4 = "",
					dbName = "SBODEMOAU_SL";
				value1 = sBatchNum;
				value2 = "'" + sDraftNum + "'"
				queryTag = "getBatchData";
				this.fGetSearchDataDet(dbName, "spAppBankIntegration", queryTag, value1, value2, value3, value4);
				this.oMdlAP.refresh();

				//Disable field in preview mode
				if (oRowSelected.U_App_Status === 'Draft') {
					this.getView().byId("btnPostDraft").setEnabled(true);
					this.getView().byId("btnExport").setEnabled(false);
					this.getView().byId("btnSaveAsDraft").setEnabled(true);
					this.getView().byId("btnCancel").setEnabled(false);
					
					this.getView().byId("DocumentNo").setEnabled(true);
					this.getView().byId("PrintingBranch").setEnabled(true);
					this.getView().byId("DispatchTo").setEnabled(true);
					this.getView().byId("DispatchToCode").setEnabled(true);
					this.getView().byId("PNBAccountNo").setEnabled(true);
					// this.getView().byId("btnSearch").setVisible(true);
				} else {
					this.getView().byId("btnPostDraft").setEnabled(false);
					this.getView().byId("btnExport").setEnabled(true);
					this.getView().byId("btnSaveAsDraft").setEnabled(false);
					this.getView().byId("btnCancel").setEnabled(true);
					
					this.getView().byId("DocumentNo").setEnabled(false);
					this.getView().byId("PrintingBranch").setEnabled(false);
					this.getView().byId("DispatchTo").setEnabled(false);
					this.getView().byId("DispatchToCode").setEnabled(false);
					this.getView().byId("PNBAccountNo").setEnabled(false);
					// this.getView().byId("btnSearch").setVisible(false);
				}
			}

			//this.recordCode = DocEntry;
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("tab2");
		},
		onSelectionChangeDispatchTo: function (oEvent) {
			var sDispatchCode = this.getView().byId("DispatchToCode").getValue();
			var sResult = sDispatchCode.slice(7);
			this.getView().byId("DispatchToName").setValue(sResult);
			//MessageToast.show("onSelectionChangeTranType");
		},
		onExportFile: function (oEvent) {
			// this.fGetBPInfo(this.oMdlAP.getData().allopenAP[0].CardCode);
			this.fExportData("","Y");
		},
		onSaveAsDraft: function (oEvent) {
			AppUI5.fShowBusyIndicator(10000);
			this.fSavePostedDraft("", true);
			AppUI5.fHideBusyIndicator();
		},
		onCancelTrans: function(oEvent){
			AppUI5.fShowBusyIndicator(10000);
			var oT_PAYMENT_EXTRACTING_H = {};
			var oT_PAYMENT_EXTRACTING_D = {};

			// var sDraftNum = this.oMdlPayExtract.getData().EditRecord.DRAFTNO;
			// AppUI5.fHideBusyIndicator();
			oT_PAYMENT_EXTRACTING_H.U_App_Status ="Cancelled";
			var aBatchUpdate = [];
			var aBatchInsert = [{
				"tableName": "U_APP_ODOP",
				"data": oT_PAYMENT_EXTRACTING_H,
				"Code" : this.oMdlPayExtract.getData().EditRecord.Code
			}];
			for (var d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
				oT_PAYMENT_EXTRACTING_D.Cancelled = 'Y';

				aBatchUpdate.push(JSON.parse(JSON.stringify(({
					"tableName": "PaymentDrafts",
					"data": oT_PAYMENT_EXTRACTING_D,
					"DocEntry" : this.oMdlAP.getData().allopenAP[d].DraftDocEntry
				}))));
			}
			var sBodyRequest = this.fPrepareBatchRequestBody(aBatchInsert,aBatchUpdate);
			$.ajax({
				url: "https://sl.biotechfarms.net/b1s/v1/$batch",
				type: "POST",
				contentType: "multipart/mixed;boundary=a", 
				data: sBodyRequest,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					AppUI5.fHideBusyIndicator();
					console.error(Message);
				},
				success: function (json) {},
				context: this

			}).done(function (results) {
				if(JSON.stringify(results).search("400 Bad") !== -1) {
					var oStartIndex = results.search("value") + 10;
					var oEndIndex = results.indexOf("}") - 8;
					var oMessage = results.substring(oStartIndex,oEndIndex);
					AppUI5.fErrorLogs("U_APP_ODOP,PaymentDrafts","Cancel Batch","null","null",oMessage,"Bank Integ Payment Extraction",this.sUserCode,"null",sBodyRequest);
					sap.m.MessageToast.show(oMessage);
					AppUI5.fHideBusyIndicator();
					console.error(oMessage);
				}else{
					if (results) {
						MessageToast.show("Cancelled Transaction!");
						this.fPrepareTable(false);
						AppUI5.fHideBusyIndicator();
					}
				}
				
			});
			
		},
		onPostDraftOP: function (oEvent) {
			AppUI5.fShowBusyIndicator(10000);
			if (!this.fCheckIfBlankField()) {
				//AppUI5.fHideBusyIndicator();
				return false;
			}
			var oRecord = {};
			var oPaymentInvoices = {};
			oRecord.PaymentChecks = [];
			oRecord.PaymentInvoices = [];
			oRecord.CashFlowAssignments = [];
			var aBatchInsert = [];

			var iIndex = 0;
			var d = 0;
			//header
			for (d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
				oRecord.DocType = "rSupplier";
				oRecord.HandWritten = "tNO";
				oRecord.Printed = "tNO";
				oRecord.DocDate = this.fGetTodaysDate;
				oRecord.CardCode = this.oMdlAP.getData().allopenAP[d].CardCode;
				oRecord.CardName = this.oMdlAP.getData().allopenAP[d].CardName;
				oRecord.Address = null;
				oRecord.CashAccount = null;
				oRecord.DocCurrency = this.oMdlAP.getData().allopenAP[d].DocCur;

				//oRecord.CheckAccount = 161020;
				oRecord.Remarks = null;
				oRecord.Series = 18;
				oRecord.TransactionCode = "";
				oRecord.PaymentType = "bopt_None";
				oRecord.TransferRealAmount = 0.0;
				oRecord.DocObjectCode = "bopot_OutgoingPayments";
				oRecord.DocTypte = "rSupplier";
				oRecord.DueDate = this.fGetTodaysDate; //"2020-02-06";
				var iTotal = 0;
				var iDocEntry_ = 0;
				var iSumApplied = 0;
				var sInvType = "";
				var iCounter = 0;
				for (var i = d; i < this.oMdlAP.getData().allopenAP.length; i++) {
					if (this.oMdlAP.getData().allopenAP[d].Priority === this.oMdlAP.getData().allopenAP[i].Priority
					&&this.oMdlAP.getData().allopenAP[d].CardCode === this.oMdlAP.getData().allopenAP[i].CardCode
					&& this.oMdlAP.getData().allopenAP[d].DocDueDate === this.oMdlAP.getData().allopenAP[i].DocDueDate) {
						if(this.oMdlAP.getData().allopenAP[i].InvoiceType === 'AP'){
							sInvType = "it_PurchaseInvoice";
						}else if(this.oMdlAP.getData().allopenAP[i].InvoiceType === 'APDP'){
							sInvType = "it_PurchaseDownPayment";
						}else{
							sInvType = "it_PurchaseCreditNote";
						}
						iIndex = i;
						iSumApplied = this.oMdlAP.getData().allopenAP[i].DocTotal - this.oMdlAP.getData().allopenAP[i].WTaxAmount;
						if (iDocEntry_ === this.oMdlAP.getData().allopenAP[i].DocEntry){
							oRecord.PaymentInvoices[iCounter - 1].SumApplied = iTotal + (Math.round(iSumApplied * 100) / 100);
							iTotal = iTotal + (Math.round(iSumApplied * 100) / 100);
							
						}else{
							
							oPaymentInvoices.LineNum = 0;
							oPaymentInvoices.DocEntry = this.oMdlAP.getData().allopenAP[i].DocEntry;
							oPaymentInvoices.SumApplied = (Math.round(iSumApplied * 100) / 100); //2 decimal places
							oPaymentInvoices.AppliedFC = 0.0;
							//oPaymentInvoices.AppliedSys = this.oMdlAP.getData().allopenAP[i].PaymentAmount; //55.0;
							oPaymentInvoices.DocRate = 0.0;
							oPaymentInvoices.DocLine = 0;
							oPaymentInvoices.InvoiceType = sInvType;
							oPaymentInvoices.DiscountPercent = 0.0;
							oPaymentInvoices.PaidSum = 0.0;
							oPaymentInvoices.InstallmentId = 1;
							oPaymentInvoices.LinkDate = null;
							oPaymentInvoices.DistributionRule = null;	
							oPaymentInvoices.DistributionRule2 = null;
							oPaymentInvoices.DistributionRule3 = null;
							oPaymentInvoices.DistributionRule4 = null;
							oPaymentInvoices.DistributionRule5 = null;
							oPaymentInvoices.TotalDiscount = 0.0;
							oPaymentInvoices.TotalDiscountFC = 0.0;
							oPaymentInvoices.TotalDiscountSC = 0.0;

							iTotal = iTotal + (Math.round(iSumApplied * 100) / 100);
							//oRecord.PaymentInvoices.push(oPaymentInvoices);
							oRecord.PaymentInvoices.push(JSON.parse(JSON.stringify(oPaymentInvoices)));

							Array.prototype.push.apply(oRecord.PaymentInvoices);
							
							iDocEntry_ = this.oMdlAP.getData().allopenAP[i].DocEntry;
							iCounter = iCounter + 1;
						}
						
					}
				}

				// Array.prototype.push.apply(oRecord.PaymentInvoices);
				oRecord.CashSum = iTotal;

				aBatchInsert.push(JSON.parse(JSON.stringify(({
					"tableName": "PaymentDrafts",
					"data": oRecord
				}))));
				d = iIndex;
				oRecord.PaymentInvoices = [];
			}
			var aBatchDelete = [];
			var sBodyRequest = this.fPrepareBatchRequestBody(aBatchInsert,false,aBatchDelete);
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
					AppUI5.fHideBusyIndicator();
					console.error(xhr.responseJSON["error"].message.value);
				},
				success: function (json) {
					jQuery.sap.log.debug(json);
					AppUI5.fHideBusyIndicator();
				},
				context: this

			}).done(function (results) {
				if(JSON.stringify(results).search("400 Bad") !== -1) {
					var oStartIndex = results.search("value") + 10;
					var oEndIndex = results.indexOf("}") - 8;
					var oMessage = results.substring(oStartIndex,oEndIndex);
					AppUI5.fErrorLogs("PaymentDrafts","Posts Draft OP","null","null",oMessage,"Bank Integ Payemnt Extraction",this.sUserCode,"null",sBodyRequest);
					sap.m.MessageToast.show(oMessage);
					console.error(oMessage);
					AppUI5.fHideBusyIndicator();
				}else{
					if (results) {
						var re = /\(([^)]+)\)/g;
						var sResult = results;
						var m;
						var a = {};
						var aDocEntries = [];
						do {
							m = re.exec(sResult);
							if (m) {
								a.docentry = m[1];
								aDocEntries.push(a.docentry);
							}
						} while (m);
						for (var i = 0; i < aDocEntries.length; i++) {
							this.fUpdateDraft(aDocEntries[i]);
						}
						this.fSavePostedDraft(aDocEntries, false);
						this.fExportData(aDocEntries,"N");
						sap.m.MessageToast.show("Successfully posted Draft Outgoing Payment!");
						// if(this.oMdlAllRecord.getData() === {}){
						// 	this.fPrepareTable(true)
						// }else{this.fPrepareTable(false)}
						// // this.fPrepareTable(this.oMdlAllRecord.getData() === {} ? true : false);
						this.fPrepareTable(false)
						this.oMdlAllRecord.refresh();
						this.fClearFields();
						AppUI5.fHideBusyIndicator();
					}	
				}
			});
		},
		onClickSearch: function (oEvent) {
			var queryTag = "",
				value1 = "",
				value2 = "'0'",
				value3 = "",
				value4 = "",
				dbName = "SBODEMOAU_SL";
			var sDocNum = this.getView().byId("DocumentNo").getValue();
			var sDocNumber = sDocNum.split(',');
			var sResult = JSON.stringify(sDocNumber).replace("[", "").replace("]", "").replace(" ", "").replace(/"/g, "'");
			this.sBatchNumber = sDocNum.replace(" ", "").split(",");

			value1 = sResult.replace(" ", "");
			queryTag = "getBatchData";
			this.fGetSearchDataDet(dbName, "spAppBankIntegration", queryTag, value1, value2, value3, value4);
		},
		//search------------
		fGetSearchDataDet: function (dbName, procName, queryTag, value1, value2, value3, value4) {
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName=" + this.sDataBase + "&procName=spAppBankIntegration&QUERYTAG=" + queryTag +
					"&VALUE1=" + value1 + "&VALUE2=" + value2 + "&VALUE3=" + value3 + "&VALUE4=",
				type: "GET",
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
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					this.oMdlAP.setJSON("{\"allopenAP\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlAP, "oMdlAP");
				}
			});
		},
		fPostPaymentDraft: function (oRecord) {
			$.ajax({

				url: "https://sl.biotechfarms.net/b1s/v1/PaymentDrafts",
				type: "POST",
				contentType: "application/json",
				async: false,
				data: JSON.stringify(oRecord),
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					AppUI5.fHideBusyIndicator();
					console.error(Message);
				},
				success: function (json) {
					// var Message = xhr.responseJSON["error"].message.value;			
					// sap.m.MessageToast.show(Message);
					AppUI5.fHideBusyIndicator();
				},
				context: this

			}).done(function (results) {
				if (results) {
					this.iDocEntry = results.DocEntry;
					sap.m.MessageToast.show("Saved to Out Going Payment Draft. ");
					AppUI5.fHideBusyIndicator();
				}
			});
		},
		//Update Draft
		fUpdateDraft: function (iDocEntry) {
			var oData;
			var oT_PAYMENT_PROCESSING_H = {};
			oT_PAYMENT_PROCESSING_H.U_App_DraftNo = iDocEntry;
			oData = JSON.stringify(oT_PAYMENT_PROCESSING_H);

			$.ajax({
				url: "https://sl.biotechfarms.net/b1s/v1/PaymentDrafts(" + iDocEntry + ")",
				type: "PATCH",
				contentType: "application/json",
				async: false,
				data: oData,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;
					AppUI5.fErrorLogs("PaymentDrafts","Update Draft Batch Payment","null","null",Message,"Bank Integ Payemnt Extraction",this.sUserCode,"null",oData);			
					sap.m.MessageToast.show(Message);
					AppUI5.fHideBusyIndicator();
					console.error(Message);
				},
				success: function (json) {},
				context: this
			});
			// .done(function (results) {
			// 	if (results) {}
			// });
		},
		//end Update Draft
		//get bp info
		fGetBPInfo: function (CardCode) {
			var that = this;
			$.ajax({
				url: "https://sl.biotechfarms.net/b1s/v1/BusinessPartners?$select=CardName,CardCode,Address,FederalTaxID,ZipCode&$filter=CardCode eq '" +
					CardCode + "'",
				type: "GET",
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					AppUI5.fHideBusyIndicator();
					console.error(Message);
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					var oResult = JSON.stringify(results).replace("[", "").replace("]", "");
					this.oMdlBPInfo.setJSON("{\"EditRecord\" : " + oResult + "}");
					this.getView().setModel(this.oMdlBPInfo, "oMdlBPInfo");
					this.fExportData(oResult);
				}
			});
		},
		//get bp info----

		//Saving of Posted Draft
		fSavePostedDraft: function (aDocEntries, isDraft) {
			var aBatchDelete = [];
			var sBatchCode = "";
			try {
				var sDraftNum = this.oMdlPayExtract.getData().EditRecord.DRAFTNO;
				sBatchCode = this.oMdlPayExtract.getData().EditRecord.Code;
				this.deleteIfExisting(sBatchCode,"Header");
				if (sDraftNum > 0){
					// var aBatchDelete = [
					// 	{
					// 		"tableName": "U_APP_ODOP",
					// 		"data": sBatchCode
					// 	}
					// ];
					for (var d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
						sBatchCode = this.oMdlAP.getData().allopenAP[d].BatchDetailCode;
						this.deleteIfExisting(sBatchCode,"Details");
						// aBatchDelete.push(JSON.parse(JSON.stringify(({
						// 	"tableName": "U_APP_DOP1",
						// 	"data": sBatchCode
						// }))));
					}
				}
			} catch (error) {
				
			}
			//this.oMdlPayExtract.getData().EditRecord.DOCENTRY
			var sCodeH = AppUI5.generateUDTCode("GetCode");
			var sDraftNo = AppUI5.generateUDTCode("GetDraftNo");
			var oT_PAYMENT_EXTRACTING_H = {};
			var oT_PAYMENT_EXTRACTING_D = {};

			oT_PAYMENT_EXTRACTING_H.Code = sCodeH;
			oT_PAYMENT_EXTRACTING_H.Name = sCodeH;
			// oT_PAYMENT_EXTRACTING_H.U_App_DocEntry = DocEntry ;//this.DocEntry;
			oT_PAYMENT_EXTRACTING_H.U_App_DocNum = this.oMdlPayExtract.getData().EditRecord.DOCNUM; //'BFI202001292017_007';//
			oT_PAYMENT_EXTRACTING_H.U_App_PNBPrntBrnch = this.oMdlPayExtract.getData().EditRecord.PRINTINGBRANCH; //'4053'; //
			oT_PAYMENT_EXTRACTING_H.U_App_DistPatchTo = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTO; //BN - Customer'; //
			oT_PAYMENT_EXTRACTING_H.U_App_DispatchCode = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTOCODE; //'4053'; // 
			oT_PAYMENT_EXTRACTING_H.U_App_DispatchName = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTONAME; //'PNB GSC Santiago Branch'; //
			oT_PAYMENT_EXTRACTING_H.U_App_PNBAccountNo = this.oMdlPayExtract.getData().EditRecord.PNBACCOUNTNO; //'RBA'; //
			oT_PAYMENT_EXTRACTING_H.U_App_PNBAccountName = this.oMdlPayExtract.getData().EditRecord.PNBACCOUNTNAME; //'12398726'; //
			oT_PAYMENT_EXTRACTING_H.U_App_Remarks = ""; //this.oMdlPayExtract.getData().EditRecord.Remarks;
			oT_PAYMENT_EXTRACTING_H.U_App_Status = (!isDraft ? "Posted Draft Document" : "Draft");
			oT_PAYMENT_EXTRACTING_H.U_App_DraftNo = (this.oMdlPayExtract.getData().EditRecord.DRAFTNO === "" ? sDraftNo : this.oMdlPayExtract.getData().EditRecord.DRAFTNO);
			oT_PAYMENT_EXTRACTING_H.U_App_CreatedBy = this.sUserCode;
			oT_PAYMENT_EXTRACTING_H.U_App_CreatedDate = this.fGetTodaysDate();

			var aBatchInsert = [{
				"tableName": "U_APP_ODOP",
				"data": oT_PAYMENT_EXTRACTING_H
			}];
			var sCode = "";
			var sBatchNum = "";
			var sSupplier = "";
			var sCheckDate = "";
			var sPriority = "";
			var iIndex = 0;
			for (var d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
				sCode = AppUI5.generateUDTCode("GetCode");
				oT_PAYMENT_EXTRACTING_D.Code = sCode;
				oT_PAYMENT_EXTRACTING_D.Name = sCode;
				oT_PAYMENT_EXTRACTING_D.U_App_DocNum = this.oMdlAP.getData().allopenAP[d].BatchNum;
				if(sBatchNum !== "" ){
					if(sPriority !== this.oMdlAP.getData().allopenAP[d].Priority
						|| sSupplier !== this.oMdlAP.getData().allopenAP[d].CardCode
						|| sCheckDate !== this.oMdlAP.getData().allopenAP[d].DocDueDate){
						iIndex = iIndex + 1;
					}
				}
				oT_PAYMENT_EXTRACTING_D.U_App_DocEntry = (!isDraft ? aDocEntries[iIndex] : "");
				oT_PAYMENT_EXTRACTING_D.U_App_DraftNo =  (this.oMdlPayExtract.getData().EditRecord.DRAFTNO === "" ? sDraftNo : this.oMdlPayExtract.getData().EditRecord.DRAFTNO);
				oT_PAYMENT_EXTRACTING_D.U_App_InvDocNum = this.oMdlAP.getData().allopenAP[d].DocNum;
				oT_PAYMENT_EXTRACTING_D.U_App_CreatedBy = this.sUserCode;
				oT_PAYMENT_EXTRACTING_D.U_App_CreatedDate = this.fGetTodaysDate();
 
				aBatchInsert.push(JSON.parse(JSON.stringify(({
					"tableName": "U_APP_DOP1",
					"data": oT_PAYMENT_EXTRACTING_D
				}))));
				sBatchNum = this.oMdlAP.getData().allopenAP[d].BatchNum;
				sSupplier = this.oMdlAP.getData().allopenAP[d].CardCode;
				sCheckDate = this.oMdlAP.getData().allopenAP[d].DocDueDate;
				sPriority = this.oMdlAP.getData().allopenAP[d].Priority;
			}
			var sBodyRequest = this.fPrepareBatchRequestBody(aBatchInsert,false,aBatchDelete);
			$.ajax({
				url: "https://sl.biotechfarms.net/b1s/v1/$batch",
				type: "POST",
				contentType: "multipart/mixed;boundary=a",
				data: sBodyRequest,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					AppUI5.fHideBusyIndicator();
					console.error(Message);
				},
				success: function (json) {},
				context: this

			}).done(function (results) {
				if(JSON.stringify(results).search("400 Bad") !== -1) {
					var oStartIndex = results.search("value") + 10;
					var oEndIndex = results.indexOf("}") - 8;
					var oMessage = results.substring(oStartIndex,oEndIndex);

					// var trimmedString = sBodyRequest.substring(0, 254);
					AppUI5.fErrorLogs("U_APP_ODOP,U_APP_DOP1","Add Batch Payment","null","null",oMessage,"Bank Integ Payment Extraction",this.sUserCode,"null",sBodyRequest);
					sap.m.MessageToast.show(oMessage);
					console.error(oMessage);
				}else{
					if (results) {
						if (isDraft) {
							MessageToast.show("Saved as Draft!");
							this.fPrepareTable(false);
							this.oMdlAllRecord.refresh();
							this.fClearFields();
						}
					}
				}
			});
		},
		deleteIfExisting: function(oDetailsCode,Type){
			$.ajax({
				url: "https://xs.biotechfarms.net/app_xsjs/ExecQuery.xsjs?dbName="+ this.sDataBase +"&procName=spAppBankIntegration&QUERYTAG=CheckIfExistPE"
				+ "&VALUE1=" + 	oDetailsCode + "&VALUE2="+ Type +"&VALUE3=&VALUE4=",
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
		fExportData: function (aDocEntries,isDirectExport) {

			this.oRecord= {};
			this.oRecord.Details= [];
			this.oContent={};
			this.dataObject= {};
			var sSupplier = "";
			var sCheckDate = "";
			var sPriority = "";
			var iIndex = 0;
			var iIndex2 = 0;
			for (var d = iIndex2; d < this.oMdlAP.getData().allopenAP.length; d++) {
				if(sSupplier !== ""){
					if(sPriority !== this.oMdlAP.getData().allopenAP[d].Priority 
						||sSupplier !== this.oMdlAP.getData().allopenAP[d].CardCode
						|| sCheckDate !== this.oMdlAP.getData().allopenAP[d].DocDueDate){
						iIndex = iIndex + 1;
					}
				}
				var iTotalCheck = 1;
				var sPayeeName = this.oMdlAP.getData().allopenAP[d].CardName;
				var sAddress = (this.oMdlAP.getData().allopenAP[d].Address === null ? "" :  this.oMdlAP.getData().allopenAP[d].Address);
				var sAddress2 = "";
				var sTIN = (this.oMdlAP.getData().allopenAP[d].TIN === null ? "" :  this.oMdlAP.getData().allopenAP[d].TIN);
				var sZipCode = (this.oMdlAP.getData().allopenAP[d].ZipCode === null ? "" :  this.oMdlAP.getData().allopenAP[d].ZipCode);
				var sPayeeCode =this.oMdlAP.getData().allopenAP[d].CardCode;//results.CardCode;
				var sPNBAccountNo = this.oMdlPayExtract.getData().EditRecord.PNBACCOUNTNO;//'RBA'; //
				var sToday = new Date();
				var sDate =  ("0" + sToday.getDate()).slice(-2) + '/' + ("0" + (sToday.getMonth() + 1)).slice(-2) + '/' +  sToday.getFullYear().toString().substr(-2);
				var sPrintingBranch = this.oMdlPayExtract.getData().EditRecord.PRINTINGBRANCH;//'4053'; //
				var sDispatchMode= "O";
				var sDispatchTo = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTO;//'4053'; // 
				var sDispatchCode = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTOCODE;
				var sDispatchToName = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTONAME;//'PNB GSC Santiago Branch'; //
				var sFileRefNo = (isDirectExport ==="Y" ? this.oMdlAP.getData().allopenAP[d].DraftDocEntry : aDocEntries[iIndex]);
				var sWHTApplicable = "";
				var sWHTTaxCode = "";
				var sWHTTaxRate = "";
				var sVATApplicable  = "";
				var sWHTDateBaseAmount = "";
				var iTotalAmount = 0;
				var sRecordIdentifier = "I";
				var sInvoiceNo  = this.oMdlAP.getData().allopenAP[d].DocNum;
				var sInvoiceDate = this.oMdlAP.getData().allopenAP[d].DocDate;
				var sYear = sInvoiceDate.substring(0, 4);
				var sMonth = sInvoiceDate.substring(4, 6);
				var sDay = sInvoiceDate.substring(6, 8);

				sInvoiceDate =  sMonth + '/' + sDay + '/' + sYear.toString().substr(-2) ;

				var sDocDueDate = this.oMdlAP.getData().allopenAP[d].DocDueDate;
				var s_Year = sDocDueDate.substring(0, 4);
				var s_Month = sDocDueDate.substring(4, 6);
				var s_Day = sDocDueDate.substring(6, 8);

				sDocDueDate =  s_Year + '/' + s_Month + '/' + s_Day.toString().substr(-2) ;

				var sDesc = this.oMdlAP.getData().allopenAP[d].Dscription;
				var sInvoiceAmount = this.oMdlAP.getData().allopenAP[d].DocTotal;
				var sInvoiceWHTAmount = "";
				var sInvoiceVATAmount = "";
				var sInvoiceNetAmount = this.oMdlAP.getData().allopenAP[d].DocTotal;

				for (var ii = d; ii < this.oMdlAP.getData().allopenAP.length; ii++) {
					if (this.oMdlAP.getData().allopenAP[d].Priority === this.oMdlAP.getData().allopenAP[ii].Priority
						&& this.oMdlAP.getData().allopenAP[d].CardCode === this.oMdlAP.getData().allopenAP[ii].CardCode
						&& this.oMdlAP.getData().allopenAP[d].DocDueDate === this.oMdlAP.getData().allopenAP[ii].DocDueDate) {
							iTotalAmount = iTotalAmount + this.oMdlAP.getData().allopenAP[ii].DocTotal - this.oMdlAP.getData().allopenAP[ii].WTaxAmount;
					}	
				}	
				this.oContent.Details = "D" + "~" + iTotalAmount.toFixed(2) + "~" + sPayeeName  + "~" + sAddress  + "~" + sAddress2
										+ "~" + sTIN + "~" + sZipCode + "~" + sPayeeCode + "~" + sPNBAccountNo	+ "~" + sDocDueDate + "~" + sPrintingBranch
										+ "~" + sDispatchMode + "~" + sDispatchTo + "~" + sDispatchCode + "~" + sDispatchToName 
										+ "~" + sFileRefNo + "~" + sWHTApplicable + "~" + sWHTTaxCode + "~" + sWHTTaxRate 
										+ "~" + sVATApplicable + "~" + sWHTDateBaseAmount;
				this.oRecord.Details.push(JSON.parse(JSON.stringify(this.oContent)));

				for (var i = d; i < this.oMdlAP.getData().allopenAP.length; i++) {
					if (this.oMdlAP.getData().allopenAP[d].Priority === this.oMdlAP.getData().allopenAP[i].Priority
						&& this.oMdlAP.getData().allopenAP[d].CardCode === this.oMdlAP.getData().allopenAP[i].CardCode
						&& this.oMdlAP.getData().allopenAP[d].DocDueDate === this.oMdlAP.getData().allopenAP[i].DocDueDate) {
						
						var sInvDate = this.oMdlAP.getData().allopenAP[i].DocDate;
						// var sYear = sInvoiceDate.substring(0, 4);
						// var sMonth = sInvoiceDate.substring(4, 6);
						// var sDay = sInvoiceDate.substring(6, 8);
		
						sInvDate =  sInvDate.substring(4, 6) + '/' + sInvDate.substring(6, 8) + '/' + sInvDate.substring(0, 4).toString().substr(-2) ;

						
						this.oContent.Details = "I" + "~"
												+ this.oMdlAP.getData().allopenAP[i].DocNum + "~" 
												+ sInvDate + "~" 
												+ this.oMdlAP.getData().allopenAP[i].Dscription + "~" 
												+ this.oMdlAP.getData().allopenAP[i].DocTotal.toFixed(2) + "~" 
												+ sInvoiceWHTAmount + "~" + sInvoiceVATAmount
									   			+ "~" + (this.oMdlAP.getData().allopenAP[i].DocTotal.toFixed(2) - (this.oMdlAP.getData().allopenAP[i].WTaxAmount));
						// iTotalAmount = iTotalAmount + this.oMdlAP.getData().allopenAP[i].DocTotal;
						this.oRecord.Details.push(JSON.parse(JSON.stringify(this.oContent)));
						iIndex2 = i;	
					}
				}

				// this.oContent.Details = "D" + "~" + iTotalAmount.toFixed(2) + "~" + sPayeeName  + "~" + sAddress  + "~" + sAddress2
				// 						+ "~" + sTIN + "~" + sZipCode + "~" + sPayeeCode + "~" + sPNBAccountNo	+ "~" + sDate + "~" + sPrintingBranch
				// 						+ "~" + sDispatchMode + "~" + sDispatchTo + "~" + sDispatchCode + "~" + sDispatchToName 
				// 						+ "~" + sFileRefNo + "~" + sWHTApplicable + "~" + sWHTTaxCode + "~" + sWHTTaxRate 
				// 						+ "~" + sVATApplicable + "~" + sWHTDateBaseAmount;
				// this.oRecord.Details.push(JSON.parse(JSON.stringify(this.oContent)));
				
				// //NDC 04/17/2020
				// this.oContent.Details = sRecordIdentifier + "~" + sInvoiceNo + "~" + sInvoiceDate + "~" + sDesc
				// 					   + "~" + sInvoiceAmount.toFixed(2) + "~" + sInvoiceWHTAmount + "~" + sInvoiceVATAmount
				// 					   + "~" + sInvoiceNetAmount.toFixed(2);
				// 		iTotalAmount = iTotalAmount + sInvoiceAmount ;
				// 		this.oRecord.Details.push(JSON.parse(JSON.stringify(this.oContent)));
				sSupplier = this.oMdlAP.getData().allopenAP[d].CardCode;
				sCheckDate = this.oMdlAP.getData().allopenAP[d].DocDueDate;
				sPriority = this.oMdlAP.getData().allopenAP[d].Priority;
				 d = iIndex2;
				}
			this.oMdlFileExport = new JSONModel(this.oRecord);
			this.getView().setModel(this.oMdlFileExport, "oMdlFileExport");
			this.fHandleExcelExport(this.oRecord);

		},

		fCheckIfBlankField: function () {
			if (this.getView().byId("DocumentNo").getValue() === "") {
				MessageToast.show("Please choose batch!");
				return false;
			} else if (this.getView().byId("PrintingBranch").getValue() === "") {
				MessageToast.show("Please choose Printing Branch!");
				return false;
			} else if (this.getView().byId("DispatchTo").getValue() === "") {
				MessageToast.show("Please choose Dispatch to!");
				return false;
			} else if (this.getView().byId("DispatchToCode").getValue() === "") {
				MessageToast.show("Please choose Dispatch to Code!");
				return false;
			} else if (this.getView().byId("PNBAccountNo").getValue() === "") {
				MessageToast.show("Please choose PNB Account!");
				return false;
			}
			return true;
		},
		onExit: function () {
			if (this._oDialog) {
				this._oDialog.destroy();
			}
		},

		handleSelectDialogPress: function (oEvent) {
			var oButton = oEvent.getSource();
			if (!this._oDialog) {
				Fragment.load({
					name: "com.apptech.app-bankinteg.view.fragments.BatchDialogFragment",
					controller: this
				}).then(function (oDialog) {
					this._oDialog = oDialog;
					this._oDialog.setModel(this.getView().getModel("oMdlBatch"), "oMdlBatch");

					this._configDialog(this._oDialog);
					this._oDialog.open();
				}.bind(this));
			} else {
				this._configDialog(oButton);
				this._oDialog.open();
			}
		},

		_configDialog: function (oButton) {
			// Multi-select if required
			var bMultiSelect = true;
			this._oDialog.setMultiSelect(bMultiSelect);
			// Set draggable property
			var bDraggable = oButton.data("draggable");
			this._oDialog.setDraggable(bDraggable == "true");
			// Set draggable property
			var bResizable = oButton.data("resizable");
			this._oDialog.setResizable(bResizable == "true");

			// Set style classes
			var sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			var sResponsivePadding = oButton.data("responsivePadding");
			if (sResponsivePadding) {
				this._oDialog.addStyleClass(sResponsiveStyleClasses);
			} else {
				this._oDialog.removeStyleClass(sResponsiveStyleClasses);
			}

			// clear the old search filter
			this._oDialog.getBinding("items").filter([]);

			// toggle compact style
			jQuery.sap.syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		},

		handleSearchs: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("U_App_DocNum", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		handleClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				this.getView().byId("DocumentNo").setValue(aContexts.map(function (oContext) {
					return oContext.getObject().U_App_DocNum;
				}).join(", "));
				MessageToast.show("You have chosen " + aContexts.map(function (oContext) {
					return oContext.getObject().U_App_DocNum;
				}).join(", "));
			} else {
				MessageToast.show("No new item was selected.");
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		handleValueHelp: function () {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "sap.m.sample.SelectDialog.view.ValueHelp",
					controller: this
				}).then(function (oValueHelpDialog) {
					this._oValueHelpDialog = oValueHelpDialog;
					this.getView().addDependent(this._oValueHelpDialog);
					this._configValueHelpDialogs();
					this._oValueHelpDialog.open();
				}.bind(this));
			} else {
				this._configValueHelpDialogs();
				this._oValueHelpDialog.open();
			}
		},
		_configValueHelpDialogs: function () {
			var sInputValue = this.byId("productInput").getValue(),
				oModel = this.getView().getModel("oMdlBatch"),
				aBatch = oModel.getProperty("/allbatch");

			aBatch.forEach(function (oBatch) {
				oBatch.selected = (oBatch.U_App_DocNum === sInputValue);
			});
			oModel.setProperty("/allbatch", aBatch);
		},
		handleValueHelpClose: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem"),
				oInput = this.byId("productInput");
			if (oSelectedItem) {
				this.byId("productInput").setValue(oSelectedItem.getTitle());
			}
			if (!oSelectedItem) {
				oInput.resetProperty("value");
			}
		},
		//Batch Fragment---------------
		//Bank FRAGMENT -------------------
		handleValueHelpBank: function () {
			if (!this._oValueHelpDialog) {
				Fragment.load({
					name: "com.apptech.app-bankinteg.view.fragments.BankDialogFragment",
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
			var sInputValue = this.byId("PNBAccountNo").getValue(),
				oModel = this.getView().getModel("oMdlBank"),
				aList = oModel.getProperty("/allpnbbank");

			aList.forEach(function (oRecord) {
				oRecord.selected = (oRecord.BankCode === sInputValue);
			});
		},
		handleSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("BankCode", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},
		handleValueHelpCloseBank: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var BankDetails = {};
			if (aContexts && aContexts.length) {
				BankDetails = aContexts.map(function (oContext) {
					var oBankDetails = {};
					oBankDetails.PNBAccountNo = oContext.getObject().BankCode;
					oBankDetails.PNBAccountName = oContext.getObject().Account;
					return oBankDetails;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.getView().byId("PNBAccountNo").setValue(BankDetails[0].PNBAccountName);
			this.getView().byId("PNBAccountName").setValue(BankDetails[0].PNBAccountNo);
			this.oMdlEditRecord.refresh();
		},
		//Bank FRAGMENT -------------------
		fGetTodaysDate: function () {
			var sToday = new Date();
			var sDate = sToday.getFullYear() + '-' + (sToday.getMonth() + 1) + '-' + sToday.getDate();
			return sDate;
		},
		fPrepareBatchRequestBody: function (oRequestInsert,oRequestUpdate,oBatchDelete) {

			var sBatchRequest = "";

			var sBeginBatch = "--a\nContent-Type: multipart/mixed;boundary=b\n\n";
			var sEndBatch = "--b--\n--a--";

			sBatchRequest = sBatchRequest + sBeginBatch;
			
			if (oRequestUpdate !== false){
				//Update
				//Update UDT
				for (var i = 0; i < oRequestInsert.length; i++) {

					objectUDT = oRequestInsert[i];
					sBatchRequest = sBatchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
					sBatchRequest = sBatchRequest + "PATCH /b1s/v1/"  + objectUDT.tableName + "('"+ objectUDT.Code +"')";
					sBatchRequest = sBatchRequest + "\nContent-Type: application/json\n\n";
					sBatchRequest = sBatchRequest + JSON.stringify(objectUDT.data) + "\n\n";
				}
				//update Draft Document	
				var objectUDTUpdate = "";
				for (var i = 0; i < oRequestUpdate.length; i++) { 
	
					objectUDTUpdate = oRequestUpdate[i];
					sBatchRequest = sBatchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
					sBatchRequest = sBatchRequest + "PATCH /b1s/v1/"  + objectUDTUpdate.tableName + "("+ objectUDTUpdate.DocEntry +")";
					sBatchRequest = sBatchRequest + "\nContent-Type: application/json\n\n";
					sBatchRequest = sBatchRequest + JSON.stringify(objectUDTUpdate.data) + "\n\n";
				}
			}else{
				//DELETE
				//aBatchDelete
				if(oBatchDelete.length !== 0){
					var objectUDTDelete = "";
					for (var i = 0; i < oBatchDelete.length; i++) { 
		
						objectUDTDelete = oBatchDelete[i];
						sBatchRequest = sBatchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
						sBatchRequest = sBatchRequest + "DELETE /b1s/v1/"  + objectUDTDelete.tableName + "('"+ objectUDTDelete.data +"')\n";
					}
				}
				//POST
				var objectUDT = "";
				for (var i = 0; i < oRequestInsert.length; i++) {
	
					objectUDT = oRequestInsert[i];
					sBatchRequest = sBatchRequest + "--b\nContent-Type:application/http\nContent-Transfer-Encoding:binary\n\n";
					sBatchRequest = sBatchRequest + "POST /b1s/v1/" + objectUDT.tableName;
					sBatchRequest = sBatchRequest + "\nContent-Type: application/json\n\n";
					sBatchRequest = sBatchRequest + JSON.stringify(objectUDT.data) + "\n\n";
				}
			}

			sBatchRequest = sBatchRequest + sEndBatch;

			return sBatchRequest;

		},
		//Exporting of data to txt file
		fHandleExcelExport: function (header, details) {
			//Generate text file name
			var sFileName;
			var sCostumerCode = "1131141";
			var sToday = new Date();
			var sDate = ("0" + (sToday.getMonth() + 1)).slice(-2) + '' + ("0" + sToday.getDate()).slice(-2) + '' + sToday.getFullYear().toString().substr(-
				2);
			var sLastBatch = AppUI5.generateUDTCode("GetLastBatchOfDay");
			if (sLastBatch === "0") {
				sLastBatch = 1;
			}
			var sPad = "000";
			var sResult = (sPad + sLastBatch).slice(-sPad.length);

			sFileName = "EC" + sCostumerCode + sDate + sResult;
			//Generate text file name

			// getting model into oModel variable.
			var oModel = this.getView().getModel("oMdlFileExport"); //this.getView().getModel("oMdlFileExport");

			var aTextFileExport = this.getView().getModel("oMdlFileExport").getData().Details;
			onSaveTextFile(aTextFileExport,sFileName);
			return;

			// comment for meantime
			// var oExport = new Export({
			// exportType: new ExportTypeCSV({
			// 	// for xls....
			// 	fileExtension: "txt",
			// 	separatorChar: "\t",
			// 	charset: "utf-8",
			// 	mimeType: "application/vnd.ms-excel"
			// }),
			// models: oModel,

			// rows: {
			// 	path: "/Details"
			// }
			// ,
			// columns: {
			// 	// name: 1,
			// 	template: {
			// 	content: "{Details}"
			// 	}
			// }
			// });

			// oExport.saveFile(fileName).catch(function (oError) {
			// 	sap.m.MessageToast.show("Generate is not possible beause no model was set");
			// }).then(function () {
			// 	oExport.destroy();
			// });
		}

	});
	function onSaveTextFile(aBlob,fileName) {
		var aBlobString = aBlob.map(a => a.Details+"\n");
		var blob = new Blob(aBlobString, {
			type: "text/plain;charset=utf-8"
		});
		saveAs(blob, fileName);
	}
});
