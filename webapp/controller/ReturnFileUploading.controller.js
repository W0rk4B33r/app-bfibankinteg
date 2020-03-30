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

	return Controller.extend("com.apptech.app-bankinteg.controller.ReturnFileUploading", {

        onRoutePatternMatched: function (event) {
			document.title = "BFI BANKINTEG";
		},

		onInit: function () {
			this.oMdlUploading = new JSONModel("model/returnfileuploading.json");
			this.getView().setModel(this.oMdlUploading, "oMdlUploading");
			
			//get DataBase loggedin
			this.sDataBase = jQuery.sap.storage.Storage.get("dataBase");	
		},
		FileUpload: function(oEvent){
			var oFileUploader = this.getView().byId("fileUploader");
			var domRef = oFileUploader.getFocusDomRef();
			var file = domRef.files[0];
			var that = this;
			this.fileName = file.name;
			this.fileType = file.type;
			var reader = new FileReader();
			reader.onload = function(e){
				var arrTxt = e.currentTarget.result.split("~");
				var oData = [];
					var record = {};
					  	record.CheckAmount = arrTxt[1];//arrTxt[i].substring(9, 17);
					  	record.CheckNum = arrTxt[2];
					  	record.VoucherNum = arrTxt[3];//arrTxt[i].substring(37, 46);
					  	record.SupplierCode =arrTxt[5];//arrTxt[i].substring(183, 187);
					  	record.SupplierName = arrTxt[4];//arrTxt[i].substring(178, 182);
					  	record.BankAccount = arrTxt[6];
					  	record.PaymentDate = arrTxt[7];
					  	record.CheckDate = arrTxt[8];
					  	record.RefNum = arrTxt[9];
					  	
					  
					  	oData.push(JSON.parse(JSON.stringify(record)));
				that.getView().getModel("oMdlUploading").setProperty("/Uploading", oData);
			};
			reader.readAsBinaryString(file);
			
		},
		PostOutGoingPayment: function(oEvent){
			var sDocEntry;
			var oRecord = {};
			var oPaymentChecks = {};
			var oPaymentInvoices = {};
			var oCashFlowAssignments = {};
			oRecord.PaymentChecks = [];
			oRecord.PaymentInvoices = [];
			oRecord.CashFlowAssignments = [];
			//header
				// oRecord.DocNum = 512;
				// oRecord.DocType = "rSupplier";
				// oRecord.HandWritten = "tNO";
				// oRecord.Printed = "tNO";
				 oRecord.DocDate = new Date(Date.parse(this.oMdlUploading.getData().Uploading[0].PaymentDate));
				// oRecord.CardCode = this.oMdlUploading.getData().allopenAP[0].CardCode;
				// oRecord.CardName = this.oMdlUploading.getData().allopenAP[0].CardName;
				// oRecord.Address = null;
				// oRecord.CashAccount = null;
				// oRecord.DocCurrency = this.oMdlUploading.getData().allopenAP[0].DocCur;
				// oRecord.CashSum = 0.0;
				// oRecord.CheckAccount = null;
				// oRecord.TransferAccount = "161010";
				// oRecord.TransferSum = 0.0;
				// oRecord.TransferDate = null;
				// oRecord.TransferReference = null;
				// oRecord.LocalCurrency = "tNO";
				// oRecord.DocRate = 0.0;
				// oRecord.Reference1 = null;
				// oRecord.Reference2 = null;
				oRecord.CounterReference = this.oMdlUploading.getData().Uploading[0].VoucherNum;
				//oRecord.Remarks = null;
				// oRecord.JournalRemarks = "Outgoing Payments - FSQR001";
				// oRecord.SplitTransaction = "tNO";
				// oRecord.ContactPersonCode = null;
				// oRecord.ApplyVAT = "tYES";
				// oRecord.TaxDate = "2020-02-06";
			//	oRecord.Series = 15;
				// oRecord.BankCode = null;
				// oRecord.BankAccount = null;
				// oRecord.DiscountPercent = 0.0;
				// oRecord.ProjectCode = null;
				// oRecord.CurrencyIsLocal = "tNO";
				// oRecord.DeductionPercent = 0.0;
				// oRecord.DeductionSum = 0.0;
				// oRecord.CashSumFC = 0.0;
				// oRecord.CashSumSys = 0.0;
				// oRecord.BoeAccount = null;
				// oRecord.BillOfExchangeAmount = 0.0;
				// oRecord.BillofExchangeStatus = null;
				// oRecord.BillOfExchangeAmountFC = 0.0;
				// oRecord.BillOfExchangeAmountSC = 0.0;
				// oRecord.BillOfExchangeAgent = null;
				// oRecord.WTCode = null;
				// oRecord.WTAmount = 0.0;
				// oRecord.WTAmountFC = 0.0;
				// oRecord.WTAmountSC = 0.0;
				// oRecord.WTAccount = null;
				// oRecord.WTTaxableAmount = 0.0;
				// oRecord.Proforma = "tNO";
				// oRecord.PayToBankCode = null;
				// oRecord.PayToBankBranch = null;
				// oRecord.PayToBankAccountNo = null;
				// oRecord.PayToCode = null;
				// oRecord.PayToBankCountry = null;
				// oRecord.IsPayToBank = "tNO";
				//oRecord.DocEntry = 70;
				// oRecord.PaymentPriority = "bopp_Priority_6";
				// oRecord.TaxGroup = null;
				// oRecord.BankChargeAmount = 0.0;
				// oRecord.BankChargeAmountInFC = 0.0;
				// oRecord.BankChargeAmountInSC = 0.0;
				// oRecord.UnderOverpaymentdifference = 0.0;
				// oRecord.UnderOverpaymentdiffSC = 0.0;
				// oRecord.WtBaseSum = 0.0;
				// oRecord.WtBaseSumFC = 0.0;
				// oRecord.WtBaseSumSC = 0.0;
				// oRecord.VatDate = "2020-02-06";
				// oRecord.TransactionCode = "";
				// oRecord.PaymentType = "bopt_None";
				// oRecord.TransferRealAmount = 0.0;
				// oRecord.DocObjectCode = "bopot_OutgoingPayments";
				// oRecord.DocTypte = "rSupplier";
				// oRecord.DueDate = this.getTodaysDate;//"2020-02-06";
				// oRecord.LocationCode = null;
				// oRecord.Cancelled = "tNO";
				// oRecord.ControlAccount = "";
				// oRecord.UnderOverpaymentdiffFC = 0.0;
				// oRecord.AuthorizationStatus = "pasWithout";
				// oRecord.BPLID = null;
				// oRecord.BPLName = null;
				// oRecord.VATRegNum = null;
				// oRecord.BlanketAgreement = null;
				// oRecord.PaymentByWTCertif = "tNO";
				// oRecord.Cig = null;
				// oRecord.Cup = null;
				// oRecord.U_APP_IsPosted = "N";
				oRecord.CashSum = 0.0;
				sDocEntry = this.oMdlUploading.getData().Uploading[0].RefNum.replace(" ","");
				for (var d = 0; d < this.oMdlUploading.getData().Uploading.length; d++) {
					// //check details
					oPaymentChecks.LineNum = 0;
					oPaymentChecks.DueDate = new Date(Date.parse(this.oMdlUploading.getData().Uploading[d].CheckDate));//this.oMdlUploading.getData().Uploading[d].CheckDate;// "2020-02-06";
					oPaymentChecks.CheckNumber = this.oMdlUploading.getData().Uploading[d].CheckNum; //1234;
					oPaymentChecks.BankCode = "PNB";
					oPaymentChecks.Branch = "123-0129";//"803-279";
					oPaymentChecks.AccounttNum = this.oMdlUploading.getData().Uploading[d].BankAccount;//"23058023";
					oPaymentChecks.Details = null;
					oPaymentChecks.Trnsfrable = "tNO";
					oPaymentChecks.CheckSum = this.oMdlUploading.getData().Uploading[d].CheckAmount;//319.0;
					oPaymentChecks.Currency = "AUD";
					oPaymentChecks.CountryCode = "PH";
					oPaymentChecks.CheckAbsEntry = null;
					//oPaymentChecks.CheckAccount =this.oMdlUploading.getData().Uploading[d].PaymentDate;// "161020";
					oPaymentChecks.ManualCheck = "tYES";
					oPaymentChecks.FiscalID = null;
					oPaymentChecks.OriginallyIssuedBy = null;
					oPaymentChecks.Endorse = "tNO";
					oPaymentChecks.EndorsableCheckNo =  null;
		         
				oRecord.PaymentChecks.push(oPaymentChecks);
				}
				
				
	   // 		for (var d = 0; d < this.oMdlUploading.getData().returnfileuploading.length; d++) {
	    			
				// 	oPaymentInvoices.LineNum = 0;
				// 	oPaymentInvoices.DocEntry = this.oMdlAP.getData().allopenAP[d].DocNum;
				// 	oPaymentInvoices.SumApplied = this.oMdlAP.getData().allopenAP[d].PaymentAmount;//55.0;
				// 	oPaymentInvoices.AppliedFC = 0.0;
				// 	oPaymentInvoices.AppliedSys = this.oMdlAP.getData().allopenAP[d].PaymentAmount;//55.0;
				// 	oPaymentInvoices.DocRate = 0.0;
				// 	oPaymentInvoices.DocLine = 0;
				// 	oPaymentInvoices.InvoiceType = "it_PurchaseInvoice";
				// 	oPaymentInvoices.DiscountPercent = 0.0;
				// 	oPaymentInvoices.PaidSum = 0.0;
				// 	oPaymentInvoices.InstallmentId = 1;
				// 	oPaymentInvoices.WitholdingTaxApplied = 0.0;
				// 	oPaymentInvoices.WitholdingTaxAppliedFC = 0.0;
				// 	oPaymentInvoices.WitholdingTaxAppliedSC = 0.0;
				// 	oPaymentInvoices.LinkDate = null;
				// 	oPaymentInvoices.DistributionRule = null;
				// 	oPaymentInvoices.DistributionRule2 = null;
				// 	oPaymentInvoices.DistributionRule3 = null;
				// 	oPaymentInvoices.DistributionRule4 = null;
				// 	oPaymentInvoices.DistributionRule5 = null;
				// 	oPaymentInvoices.TotalDiscount = 0.0;
				// 	oPaymentInvoices.TotalDiscountFC = 0.0;
				// 	oPaymentInvoices.TotalDiscountSC = 0.0;
	    			
				// oRecord.PaymentInvoices.push(JSON.parse(JSON.stringify(oPaymentInvoices)));
	   // 		}
	   // 		Array.prototype.push.apply(oRecord.PaymentInvoices);
	    		
			// 	oCashFlowAssignments.CashFlowAssignmentsID = 2186;
			// 	oCashFlowAssignments.CashFlowLineItemID = 7;
			// 	oCashFlowAssignments.Credit = 319.0;
			// 	oCashFlowAssignments.PaymentMeans = "pmtChecks";
			// 	oCashFlowAssignments.CheckNumber = "1";
			// 	oCashFlowAssignments.AmountLC = 0.0;
			// 	oCashFlowAssignments.AmountFC = 0.0;
			// 	oCashFlowAssignments.JDTLineId = 0;
			// oRecord.CashFlowAssignments.push(oCashFlowAssignments);
			
			// this.PostPaymentDraft(oRecord);
			// this.SavePostedDraft();
			
			this.fUpdatePaymentDraft(oRecord,sDocEntry);
		},
		fUpdatePaymentDraft: function(oRecord,sDocEntry){
			$.ajax({

				url: "https://18.136.35.41:50000/b1s/v1/PaymentDrafts("+ sDocEntry + ")",
				type: "PATCH",
				contentType: "application/json",
				data: JSON.stringify(oRecord), //If batch, body data should not be JSON.stringified
				// xhrFields: {
				// 	withCredentials: true
				// },
				error: function (xhr, status, error) {
					//this.oPage.setBusy(false);
					if (xhr.status === 402) {
						sap.m.MessageToast.show("Session End.");
						sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
					}else{
						var Message = xhr.responseJSON["error"].message.value;			
						sap.m.MessageToast.show(Message);
					}
				},
				success: function (json) {
					this.PostOutgoing(sDocEntry);
				},
				context: this

			}).done(function (results) {
				if (results) {
					//this.DocEntry = results.DocEntry;
					 sap.m.MessageToast.show("Saved to Out Going Payment Draft. " );
					//this.PostOutgoing();
				}
			});
		},
		PostOutgoing: function(sDocEntry){
			$.ajax({

				url: "https://18.136.35.41:50000/b1s/v1/PaymentDrafts("+ sDocEntry + ")/SaveDraftToDocument",
				type: "POST",
				contentType: "application/json",
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;			
					sap.m.MessageToast.show(Message);
				},
				success: function (json) {
					sap.m.MessageToast.show("Successfully posted!" );
				},
				context: this

			}).done(function (results) {
				if (results) {
					sap.m.MessageToast.show("Successfully posted! " );
				}
			});
		}


    });
});
