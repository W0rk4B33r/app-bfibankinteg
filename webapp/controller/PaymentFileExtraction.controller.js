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
		},

		onInit: function () {
			//get DataBase loggedin
			this.sDataBase = jQuery.sap.storage.Storage.get("dataBase");
			this.sUserCode = jQuery.sap.storage.Storage.get("userCode");

			var oModelProd = new JSONModel("model/record.json");
			this.getView().setModel(oModelProd);

			this.oExport = new JSONModel();
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
		},

		//GET ALL BATCHCODE
		fGetRecords: function (queryTag, sRecord) {
			// var aReturnResult = [];
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=" + this.sDataBase + "&procName=spAppBankIntegration&QUERYTAG=" + queryTag +
					"&VALUE1=&VALUE2=&VALUE3=&VALUE4=",
				type: "GET",
				async: false,
				dataType: "json",
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
				},
				error: function (xhr, status, error) {
					MessageToast.show(error);
					if (xhr.status === 400) {
						sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
						sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
					} else {
						var Message = xhr.responseJSON["error"].message.value;			
						sap.m.MessageToast.show(Message);
					}
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					if (sRecord === "Batch") {
						this.oMdlBatch.setJSON("{\"allbatch\" : " + JSON.stringify(results) + "}");
						this.getView().setModel(this.oMdlBatch, "oMdlBatch");
						// }else if(Record === "AllDrafts"){
						// 		if (results.length <= 0) {
						// 			aReturnResult = [];
						// 		} else {
						// 			aReturnResult = results;
						// 		}
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
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=" + this.sDataBase + "&procName=spAppBankIntegration&QUERYTAG=" + queryTag +
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
				this.getView().byId("btnSearch").setVisible(true);
				this.getView().byId("btnPostDraft").setVisible(true);
				this.getView().byId("btnExport").setVisible(false);

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
				
				this.getView().byId("btnCancel").setVisible(false);
				this.getView().byId("btnSaveAsDraft").setVisible(true);

				this.oMdlAP.getData().allopenAP.length = 0;
				this.oMdlAP.refresh();

				this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("RECORD [ADD]");
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
				sDraftNum = oRowSelected.U_App_DraftNo;

				sBatchNum = oRowSelected.U_App_DocNum;
				sBatchNum = sBatchNum.split(',');
				sBatchNum = JSON.stringify(sBatchNum).replace("[", "").replace("]", "").replace(" ", "").replace(/"/g, "'");
				sBatchNum = sBatchNum.replace(" ", "");

				//AJAX selected Key
				$.ajax({
					url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=" + this.sDataBase + "&procName=spAppBankIntegration&QUERYTAG=getSpecificDraft" +
						"&VALUE1=" + sDraftNum + "&VALUE2=&VALUE3=&VALUE4=",
					type: "GET",
					async: false,
					dataType: "json",
					beforeSend: function (xhr) {
						xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:P@ssw0rd805~"));
					},
					error: function (xhr, status, error) {
						MessageToast.show(error);
						if (xhr.status === 400) {
							sap.m.MessageToast.show("Session End. Redirecting to Login Page..");
							sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
						} else {
							var Message = xhr.responseJSON["error"].message.value;			
							sap.m.MessageToast.show(Message);
						}
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
					this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("Record Code : " + this.oMdlPayExtract.getData().EditRecord
						.DOCENTRY + " [EDIT]");
				});

				var queryTag = "",
					value1 = "",
					value2 = "",
					value3 = "",
					value4 = "",
					dbName = "SBODEMOAU_SL";
				value1 = sBatchNum;
				value2 = sDraftNum;
				queryTag = "getBatchData";
				this.fGetSearchDataDet(dbName, "spAppBankIntegration", queryTag, value1, value2, value3, value4);
				this.oMdlAP.refresh();

				//Disable field in preview mode
				if (oRowSelected.U_App_Status === 'Draft') {
					this.getView().byId("btnPostDraft").setVisible(true);
					this.getView().byId("btnExport").setVisible(false);
					this.getView().byId("btnSaveAsDraft").setVisible(true);
					this.getView().byId("btnCancel").setVisible(false);
					
					this.getView().byId("DocumentNo").setEnabled(true);
					this.getView().byId("PrintingBranch").setEnabled(true);
					this.getView().byId("DispatchTo").setEnabled(true);
					this.getView().byId("DispatchToCode").setEnabled(true);
					this.getView().byId("PNBAccountNo").setEnabled(true);
					this.getView().byId("btnSearch").setVisible(true);
				} else {
					this.getView().byId("btnPostDraft").setVisible(false);
					this.getView().byId("btnExport").setVisible(true);
					this.getView().byId("btnSaveAsDraft").setVisible(false);
					this.getView().byId("btnCancel").setVisible(true);
					
					this.getView().byId("DocumentNo").setEnabled(false);
					this.getView().byId("PrintingBranch").setEnabled(false);
					this.getView().byId("DispatchTo").setEnabled(false);
					this.getView().byId("DispatchToCode").setEnabled(false);
					this.getView().byId("PNBAccountNo").setEnabled(false);
					this.getView().byId("btnSearch").setVisible(false);
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
			this.fExportData();
		},
		onSaveAsDraft: function (oEvent) {
			AppUI5.fShowBusyIndicator();
			this.fSavePostedDraft("", true);
			AppUI5.fHideBusyIndicator();
		},
		onCancelTrans: function(oEvent){
			AppUI5.fShowBusyIndicator();
			var oT_PAYMENT_EXTRACTING_H = {};
			var oT_PAYMENT_EXTRACTING_D = {};

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
				url: "https://18.136.35.41:50000/b1s/v1/$batch",
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
				},
				success: function (json) {},
				context: this

			}).done(function (results) {
				if (results) {
					MessageToast.show("Cancelled Transaction!");
					this.fPrepareTable(false);
					AppUI5.fHideBusyIndicator();
				}
			});
			
		},
		onPostDraftOP: function (oEvent) {
			AppUI5.fShowBusyIndicator();
			if (!this.fCheckIfBlankField()) {
				return;
			}
			var oRecord = {};
			var oPaymentInvoices = {};
			oRecord.PaymentChecks = [];
			oRecord.PaymentInvoices = [];
			oRecord.CashFlowAssignments = [];
			var aBatchInsert = [];
			//header
			for (var d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
				oRecord.DocType = "rSupplier";
				oRecord.HandWritten = "tNO";
				oRecord.Printed = "tNO";
				oRecord.DocDate = this.fGetTodaysDate;
				oRecord.CardCode = this.oMdlAP.getData().allopenAP[d].CardCode;
				oRecord.CardName = this.oMdlAP.getData().allopenAP[d].CardName;
				oRecord.Address = null;
				oRecord.CashAccount = null;
				oRecord.DocCurrency = this.oMdlAP.getData().allopenAP[d].DocCur;

				oRecord.CheckAccount = 161020;
				oRecord.Remarks = null;
				oRecord.Series = 15;
				oRecord.TransactionCode = "";
				oRecord.PaymentType = "bopt_None";
				oRecord.TransferRealAmount = 0.0;
				oRecord.DocObjectCode = "bopot_OutgoingPayments";
				oRecord.DocTypte = "rSupplier";
				oRecord.DueDate = this.fGetTodaysDate; //"2020-02-06";
				var iTotal = 0;
				// for (var i = 0; i < this.oMdlAP.getData().allopenAP.length; i++) {
				// if (this.oMdlAP.getData().allopenAP[d].CardCode === this.oMdlAP.getData().allopenAP[i].CardCode) {
				oPaymentInvoices.LineNum = 0;
				oPaymentInvoices.DocEntry = this.oMdlAP.getData().allopenAP[d].DocEntry;
				oPaymentInvoices.SumApplied = this.oMdlAP.getData().allopenAP[d].PaymentAmount; //55.0;
				oPaymentInvoices.AppliedFC = 0.0;
				oPaymentInvoices.AppliedSys = this.oMdlAP.getData().allopenAP[d].PaymentAmount; //55.0;
				oPaymentInvoices.DocRate = 0.0;
				oPaymentInvoices.DocLine = 0;
				oPaymentInvoices.InvoiceType = "it_PurchaseInvoice";
				oPaymentInvoices.DiscountPercent = 0.0;
				oPaymentInvoices.PaidSum = 0.0;
				oPaymentInvoices.InstallmentId = 1;
				oPaymentInvoices.WitholdingTaxApplied = 0.0;
				oPaymentInvoices.WitholdingTaxAppliedFC = 0.0;
				oPaymentInvoices.WitholdingTaxAppliedSC = 0.0;
				oPaymentInvoices.LinkDate = null;
				oPaymentInvoices.DistributionRule = null;
				oPaymentInvoices.DistributionRule2 = null;
				oPaymentInvoices.DistributionRule3 = null;
				oPaymentInvoices.DistributionRule4 = null;
				oPaymentInvoices.DistributionRule5 = null;
				oPaymentInvoices.TotalDiscount = 0.0;
				oPaymentInvoices.TotalDiscountFC = 0.0;
				oPaymentInvoices.TotalDiscountSC = 0.0;
				iTotal = iTotal + this.oMdlAP.getData().allopenAP[d].PaymentAmount;
				oRecord.PaymentInvoices.push(JSON.stringify(oPaymentInvoices));

				Array.prototype.push.apply(oRecord.PaymentInvoices);
				oRecord.CashSum = iTotal;

				aBatchInsert.push(JSON.parse(JSON.stringify(({
					"tableName": "PaymentDrafts",
					"data": oRecord
				}))));
				// this.fPostPaymentDraft(oRecord);
			}
			var sBodyRequest = this.fPrepareBatchRequestBody(aBatchInsert,false);
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/$batch",
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
				},
				success: function (json) {
					jQuery.sap.log.debug(json);
					AppUI5.fHideBusyIndicator();
				},
				context: this

			}).done(function (results) {
				if (results) {
					var re = /\(([^)]+)\)/g;
					var sResult = results;
					var m;
					var a = {};
					var DocEntries = [];
					do {
						m = re.exec(sResult);
						if (m) {
							a.docentry = m[1];
							DocEntries.push(a.docentry);
						}
					} while (m);
					for (var i = 0; i < DocEntries.length; i++) {
						this.fUpdateDraft(DocEntries[i]);
					}
					this.fSavePostedDraft(DocEntries, false);
					this.fExportData();
					sap.m.MessageToast.show("Successfully posted Draft Outgoing Payment!");
					this.fClearFields();
					this.oMdlAllRecord.refresh();
					this.fPrepareTable(false);
					AppUI5.fHideBusyIndicator();
				}
			});
		},
		onClickSearch: function (oEvent) {
			var queryTag = "",
				value1 = "",
				value2 = 0,
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
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName=" + this.sDataBase + "&procName=spAppBankIntegration&QUERYTAG=" + queryTag +
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

				url: "https://18.136.35.41:50000/b1s/v1/PaymentDrafts",
				type: "POST",
				contentType: "application/json",
				async: false,
				data: JSON.stringify(oRecord),
				error: function (xhr, status, error) {
					sap.m.MessageToast.show(error);
				},
				success: function (json) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
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
				url: "https://18.136.35.41:50000/b1s/v1/PaymentDrafts(" + iDocEntry + ")",
				type: "PATCH",
				contentType: "application/json",
				async: false,
				data: oData,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					AppUI5.fHideBusyIndicator();
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
				url: "https://18.136.35.41:50000/b1s/v1/BusinessPartners?$select=CardName,CardCode,Address,FederalTaxID,ZipCode&$filter=CardCode eq '" +
					CardCode + "'",
				type: "GET",
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
					AppUI5.fHideBusyIndicator();
				},
				success: function (json) {},
				context: this
			}).done(function (results) {
				if (results) {
					var oResult = JSON.stringify(results).replace("[", "").replace("]", "");
					this.oMdlBPInfo.setJSON("{\"EditRecord\" : " + oResult + "}");
					this.getView().setModel(this.oMdlBPInfo, "oMdlBPInfo");
					// that.fPrepareTable(false);
					this.fExportData(oResult);
					//return results;
				}
			});
		},
		//get bp info----

		//Saving of Posted Draft
		fSavePostedDraft: function (DocEntry, isDraft) {

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
			oT_PAYMENT_EXTRACTING_H.U_App_DraftNo = sDraftNo;
			oT_PAYMENT_EXTRACTING_H.U_App_CreatedBy = this.sUserCode;
			oT_PAYMENT_EXTRACTING_H.U_App_CreatedDate = this.fGetTodaysDate();

			var aBatchInsert = [{
				"tableName": "U_APP_ODOP",
				"data": oT_PAYMENT_EXTRACTING_H
			}];
			var sCode = "";
			for (var d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
				sCode = AppUI5.generateUDTCode("GetCode");
				oT_PAYMENT_EXTRACTING_D.Code = sCode;
				oT_PAYMENT_EXTRACTING_D.Name = sCode;
				oT_PAYMENT_EXTRACTING_D.U_App_DocNum = this.oMdlAP.getData().allopenAP[d].BatchNum;
				oT_PAYMENT_EXTRACTING_D.U_App_DocEntry = (!isDraft ? DocEntry[d] : "");
				oT_PAYMENT_EXTRACTING_D.U_App_DraftNo = sDraftNo;
				oT_PAYMENT_EXTRACTING_D.U_App_InvDocNum = this.oMdlAP.getData().allopenAP[d].DocNum;
				oT_PAYMENT_EXTRACTING_D.U_App_CreatedBy = this.sUserCode;
				oT_PAYMENT_EXTRACTING_D.U_App_CreatedDate = this.fGetTodaysDate();
 
				aBatchInsert.push(JSON.parse(JSON.stringify(({
					"tableName": "U_APP_DOP1",
					"data": oT_PAYMENT_EXTRACTING_D
				}))));
			}
			var sBodyRequest = this.fPrepareBatchRequestBody(aBatchInsert,false);
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/$batch",
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
				},
				success: function (json) {},
				context: this

			}).done(function (results) {
				if (results) {
					if (isDraft) {
						MessageToast.show("Saved as Draft!");
						this.fClearFields();
						this.oMdlAllRecord.refresh();
						this.fPrepareTable(false);
					}
				}
			});
		},
		fExportData: function (DraftResults) {

			this.oRecord= {};
			this.oRecord.Details= [];
			this.oContent={};
			this.dataObject= {};
			for (var d = 0; d < this.oMdlAP.getData().allopenAP.length; d++) {
				var iTotalCheck = 1;
				var sPayeeName = this.oMdlAP.getData().allopenAP[d].CardName;
				var sAddress = (this.oMdlAP.getData().allopenAP[d].Address === null ? "" :  this.oMdlAP.getData().allopenAP[d].Address);
				var sAddress2 = "";
				var sTIN = (this.oMdlAP.getData().allopenAP[d].TIN === null ? "" :  this.oMdlAP.getData().allopenAP[d].TIN);
				var sZipCode = (this.oMdlAP.getData().allopenAP[d].ZipCode === null ? "" :  this.oMdlAP.getData().allopenAP[d].ZipCode);
				var sPayeeCode =this.oMdlAP.getData().allopenAP[d].CardCode;//results.CardCode;
				var sPNBAccountNo = this.oMdlPayExtract.getData().EditRecord.PNBACCOUNTNO;//'RBA'; //
				var sToday = new Date();
				var sDate = ("0" + sToday.getDate()).slice(-2) + '/' + ("0" + (sToday.getMonth() + 1)).slice(-2) + '/' +  sToday.getFullYear().toString().substr(-2);
				var sPrintingBranch = this.oMdlPayExtract.getData().EditRecord.PRINTINGBRANCH;//'4053'; //
				var sDispatchMode= "O";
				var sDispatchTo = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTOCODE;//'4053'; // 
				var sDispatchCode = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTOCODE;
				var sDispatchToName = this.oMdlPayExtract.getData().EditRecord.DISTPATCHTONAME;//'PNB GSC Santiago Branch'; //
				var sFileRefNo = this.iDocEntry;
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

				var sDesc = this.oMdlAP.getData().allopenAP[d].Dscription;
				var sInvoiceAmount = this.oMdlAP.getData().allopenAP[d].DocTotal;
				var sInvoiceWHTAmount = "";
				var sInvoiceVATAmount = "";
				var sInvoiceNetAmount = this.oMdlAP.getData().allopenAP[d].DocTotal;

				this.oContent.Details = "D" + "~" + sInvoiceAmount.toFixed(2) + "~" + sPayeeName  + "~" + sAddress  + "~" + sAddress2
										+ "~" + sTIN + "~" + sZipCode + "~" + sPayeeCode + "~" + sPNBAccountNo	+ "~" + sDate + "~" + sPrintingBranch
										+ "~" + sDispatchMode + "~" + sDispatchTo + "~" + sDispatchCode + "~" + sDispatchToName 
										+ "~" + sFileRefNo + "~" + sWHTApplicable + "~" + sWHTTaxCode + "~" + sWHTTaxRate 
										+ "~" + sVATApplicable + "~" + sWHTDateBaseAmount;
				this.oRecord.Details.push(JSON.parse(JSON.stringify(this.oContent)));

				this.oContent.Details = sRecordIdentifier + "~" + sInvoiceNo + "~" + sInvoiceDate + "~" + sDesc
									   + "~" + sInvoiceAmount.toFixed(2) + "~" + sInvoiceWHTAmount + "~" + sInvoiceVATAmount
									   + "~" + sInvoiceNetAmount.toFixed(2);
				iTotalAmount = iTotalAmount + sInvoiceAmount ;
				 this.oRecord.Details.push(JSON.parse(JSON.stringify(this.oContent)));

				// this.oContent.Details = RecordIdentifier + "~" + InvoiceNo + "~" + InvoiceDate + "~" + Desc
				// 					   + "~" + InvoiceAmount + "~" + InvoiceWHTAmount + "~" + InvoiceVATAmount
				// 					   + "~" + InvoiceNetAmount;
				//  totalAmount = totalAmount + InvoiceAmount ;
				//  this.oRecord.Details.push(JSON.parse(JSON.stringify(this.oContent)));

				 //this.oRecord.Details.push(JSON.parse(JSON.stringify(this.header)),JSON.parse(JSON.stringify(this.Details)));
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
		//Saving of Posted Draft
		//Batch Fragment
		// handleValueHelpBatch: function () {
		// 	if (!this._oValueHelpDialogs) {
		// 		Fragment.load({
		// 			name: "com.apptech-experts.BFI_BANKINTEG.view.fragments.BatchDialogFragment",
		// 			controller: this
		// 		}).then(function (oValueHelpDialogs) {
		// 			this._oValueHelpDialogs = oValueHelpDialogs;
		// 			this.getView().addDependent(this._oValueHelpDialogs);
		// 			this._configValueHelpDialogs();
		// 			this._oValueHelpDialogs.open();
		// 		}.bind(this));
		// 	} else {
		// 		this._configValueHelpDialogs();
		// 		this._oValueHelpDialogs.open();
		// 	}
		// },
		// _configValueHelpDialogs: function () {
		// 	var sInputValue = this.byId("DocumentNo").getValue(),
		// 		oModel = this.getView().getModel("oMdlBatch"),
		// 		aList = oModel.getProperty("/allbatch");

		// 	aList.forEach(function (oRecord) {
		// 		oRecord.selected = (oRecord.U_App_DocNum === sInputValue);
		// 	});
		// },
		// handleSearchBatch: function(oEvent) {
		// 	var sValue = oEvent.getParameter("value");
		// 	var oFilter = new Filter("U_App_DocNum", FilterOperator.Contains, sValue);
		// 	var oBinding = oEvent.getSource().getBinding("items");
		// 	oBinding.filter([oFilter]);
		// },
		// handleValueHelpCloseBatch: function (oEvent) {
		// 	var aContexts = oEvent.getParameter("selectedContexts");
		// 	var BatchDetails = {};
		// 	if (aContexts && aContexts.length) {
		// 		BatchDetails = aContexts.map(function (oContext) {
		// 			var oBatch = {};
		// 			oBatch.U_App_DocNum = oContext.getObject().U_App_DocNum;
		// 			oBatch.U_App_SupplierName = oContext.getObject().U_App_SupplierName;
		// 			return oBatch;
		// 		});
		// 	}
		// 	oEvent.getSource().getBinding("items").filter([]);
		// 	this.getView().byId("DocumentNo").setValue(BatchDetails[0].U_App_DocNum);
		// 	this.oMdlEditRecord.refresh();
		// },
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
		fPrepareBatchRequestBody: function (oRequestInsert,oRequestUpdate) {

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
