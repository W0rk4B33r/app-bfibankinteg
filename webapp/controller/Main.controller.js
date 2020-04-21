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
	"com/apptech/app-bankinteg/controller/AppUI5"
], function(jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast,AppUI5) {
"use strict";
  
	return Controller.extend("com.apptech.app-bankinteg.controller.Main", {
  
	onInit: function () {
		//PLACE HOLDER OF PROJECT OBJECT
		this.sDatabase = jQuery.sap.storage.Storage.get("dataBase");	
		this.sUserCode = jQuery.sap.storage.Storage.get("userCode");	
		
		//this.getView().byId("userCode").setText(this.userCode);
		
		//this.oMdlMenu = new JSONModel("model/menus.json");
		//get Menu/s
		this.oMdlMenu = new JSONModel();
		this.fGetAllMenu();

		this.router = this.getOwnerComponent().getRouter();
		var sSelectedMenu = this.oMdlMenu.getData().navigation[0].key;
			switch (sSelectedMenu) {
			case "paymentprocessing":
				this.router.navTo("PaymentProcessing");
				break;
			case "batchapprovalprocess":
				this.router.navTo("BatchApprovalProcess");
				break;
			case "paymentfileextraction":
				this.router.navTo("PaymentFileExtraction");
				break;
			case "returnfileuploading":
				this.router.navTo("ReturnFileUploading");
				break;

			default:

			}
		
	},
	  
		//-------------------------------------------
		onRoutePatternMatched: function (event) {
			var key = event.getParameter("name");
			this.byId("childViewSegmentedButton").setSelectedKey(key);
		},

		onAfterShow: function (router) {
			router.navTo("PaymentProcessing");
		},

		onSelect: function (event) {
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo(event.getParameter("key"));
		},

		//-------------------------------------------
	  
		onMenuButtonPress: function () {
			var toolPage = this.byId("toolPage");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},

		onIconPress: function (oEvent) {
			this.router.navTo("PaymentProcessing");
		},

		onItemSelect: function (oEvent) {
			var sSelectedMenu = oEvent.getSource().getProperty("selectedKey");
			switch (sSelectedMenu) {
			case "paymentprocessing":
				this.router.navTo("PaymentProcessing");
				break;
			case "batchapprovalprocess":
				this.router.navTo("BatchApprovalProcess");
				break;
			case "paymentfileextraction":
				this.router.navTo("PaymentFileExtraction");
				break;
			case "returnfileuploading":
				this.router.navTo("ReturnFileUploading");
				break;

			default:

			}
		},

	  //ACTION BUTTON---------------------------
		handleOpen: function (oEvent) {
			var oButton = oEvent.getSource();

			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"com.apptech.app-bankinteg.view.fragments.UserActionFragment",
					this
				);

				this.getView().addDependent(this._actionSheet);
			}

			this._actionSheet.openBy(oButton);
		},
		fGetAllMenu: function(){
			$.ajax({
				url: "https://18.136.35.41:4300/app_xsjs/ExecQuery.xsjs?dbName="+ this.sDatabase +"&procName=spAppBankIntegration&QUERYTAG=getAllMenu" +
				"&VALUE1="+ this.sUserCode +"&VALUE2=&VALUE3=&VALUE4=",
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
					this.oMdlMenu.setJSON("{\"navigation\" : " + JSON.stringify(results) + "}");
					this.getView().setModel(this.oMdlMenu);
				}
			});
		},
		onLogout: function (){ 
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/Logout",
				type: "POST",
				error: function (xhr, status, error) {
				var Message = xhr.responseJSON["error"].message.value;			
				sap.m.MessageToast.show(Message);
				},
				context:this,
				success: function (json) {
					sap.m.MessageToast.show("Session End"); 
					jQuery.sap.storage.Storage.clear();	
					sap.ui.core.UIComponent.getRouterFor(this).navTo("Login", null, true);		
				}
			});
		},
		onLoadUDTandUDF: function(){
			this.loadUDandUDF();
		},
		loadUDandUDF:function(){
		//   //create udt
		//   //Payement Processing Draft  Header
		//   AppUI5.createTable("APP_OPPD", "Payment Processing - Header", "bott_NoObject");
		//   //Payement Processing Details
		//   AppUI5.createTable("APP_PPD1", "Payment Processing - Details", "bott_NoObject");
		//   //Saved Draft OutGoing Payment
		//   AppUI5.createTable("APP_ODOP", "Payment File Extraction - Head", "bott_NoObject");
		//   //Saved Draft OutGoing Payment
		//   AppUI5.createTable("APP_DOP1", "Payment File Extraction - Det", "bott_NoObject");
		// //ACTIVITY LOG
		//   AppUI5.createTable("APP_ACTIVITYLOGS", "Activity Log", "bott_NoObject");

		//   //create udf
		//   //Payement Processing Header
		//   AppUI5.createField("App_DocNum", "Document Number", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DateFrom", "Date From", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DateTo", "Date To", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_Suppliercode", "Supplier Code", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_SupplierName", "Supplier Name", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_TaggingDate", "Tagging Date", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_Status", "Status", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_Remarks", "Remarks", "@APP_OPPD", "db_Alpha", "", 250);
		//   AppUI5.createField("App_CreatedBy", "Created By", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CreatedDate", "Created Date", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedBy", "Updated By", "@APP_OPPD", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedDate", "Updated Date", "@APP_OPPD", "db_Alpha", "", 30);
		//	 AppUI5.createField("App_DraftReference", "Draft Reference", "@APP_OPPD", "db_Alpha", "", 30)
		//   //Payement Processing Details
		//   AppUI5.createField("App_DocNum", "Document Number", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_Priority", "Priority", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_InvDocNum", "Invoice DocNum", "@APP_PPD1", "db_Alpha", "", 25);
		//   AppUI5.createField("App_InvoiceDocType", "Invoice DocType Type", "@APP_PPD1", "db_Alpha", "", 25);
		//   AppUI5.createField("App_InvoiceNo", "Invoice Number", "@APP_PPD1", "db_Alpha", "", 20);
		//   AppUI5.createField("App_InvoiceDate", "Invoice Date", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CheckDate", "Check Date", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_SuppRefNo", "Supplier Reference No", "@APP_PPD1", "db_Alpha", "", 25);
		//   AppUI5.createField("App_Remarks", "Remarks", "@APP_PPD1", "db_Alpha", "", 250);
		//   AppUI5.createField("App_InvoiceType", "Invoice Type", "@APP_PPD1", "db_Alpha", "", 10);
		//   AppUI5.createField("App_Desc", "Description", "@APP_PPD1", "db_Alpha", "", 250);
		//   AppUI5.createField("App_InvoiceCur", "Invoice Currency", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_InvoiceTotal", "InvoiceTotal", "@APP_PPD1", "db_Float", "st_Sum", 30);
		//   AppUI5.createField("App_RemainingBal", "RemainingBal ", "@APP_PPD1", "db_Float", "st_Sum", 30);
		//   AppUI5.createField("App_PaymentAmount", "PaymentAmount ", "@APP_PPD1", "db_Float", "st_Sum", 30);
		//   AppUI5.createField("App_CRANo", "CRA Number", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_LineNumber", "PaymentAmount ", "@APP_PPD1", "db_Numeric", "", 30);
		//   AppUI5.createField("App_CreatedBy", "Created By", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CreatedDate", "Created Date", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedBy", "Updated By", "@APP_PPD1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedDate", "Updated Date", "@APP_PPD1", "db_Alpha", "", 30);
		//	 AppUI5.createField("App_DraftReference", "Draft Reference", "@APP_PPD1", "db_Alpha", "", 30)
		//   // Saved Draft OutGoing Payment
		//   AppUI5.createField("App_DocEntry", "Document Entry", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DocNum", "Batch Number", "@APP_ODOP", "db_Alpha", "", 300);
		//   AppUI5.createField("App_PNBPrntBrnch", "PNB Printing Branch", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DistPatchTo", "Dispatch To", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DispatchCode", "Dispatch Code", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DispatchName", "Dispatch Name", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_PNBAccountNo", "PNB Account No", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_PNBAccountName", "PNB Account Name", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_Remarks", "Remarks", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CreatedBy", "Created By", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CreatedDate", "Created Date", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedBy", "Updated By", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedDate", "Updated Date", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_Status", "Status", "@APP_ODOP", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DraftNo", "Draft Number", "@APP_ODOP", "db_Alpha", "", 30);
		//   //tagging if Outgoing payment is created from this integ
		//   AppUI5.createField("App_isFromBankInteg", "Status", "OPDF", "db_Alpha", "", 30);
		//   //Payement Processing Details
		//   AppUI5.createField("App_DocNum", "Batch Number", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DocEntry", "Document Entry", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_DraftNo", "Draft Number", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_InvDocNum", "Inv. Document Number", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CreatedBy", "Created By", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_CreatedDate", "Created Date", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedBy", "Updated By", "@APP_DOP1", "db_Alpha", "", 30);
		//   AppUI5.createField("App_UpdatedDate", "Updated Date", "@APP_DOP1", "db_Alpha", "", 30);
		//   //Add App_BatchNum in A/R invoice once tagged batch
		//   AppUI5.createField("App_BatchNum", "Batch Number", "OPCH", "db_Alpha", "", 30);
		//   //Add App_BatchNum in A/P Downpayment once tagged batch
		//   AppUI5.createField("App_BatchNum", "Batch Number", "ODPO", "db_Alpha", "", 30);

		// // ACTIVITY LOG
		// AppUI5.createField("App_Table", "Table Affected", "@APP_ACTIVITYLOGS", "db_Alpha", "", 50);
		// AppUI5.createField("App_Operation", "Operation", "@APP_ACTIVITYLOGS", "db_Alpha", "", 50);
		// AppUI5.createField("App_Key1", "Transaction Number", "@APP_ACTIVITYLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("App_Key2", "Transaction Type", "@APP_ACTIVITYLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("App_Key3", "Transaction Type", "@APP_ACTIVITYLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("App_Process", "Process", "@APP_ACTIVITYLOGS", "db_Alpha", "", 50);
		// AppUI5.createField("App_ProcessBy", "Process By", "@APP_ACTIVITYLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("App_ProcessDate", "Process Date", "@APP_ACTIVITYLOGS", "db_Alpha", "", 30);
		// AppUI5.createField("App_ProcessDate", "Process Date", "@APP_ACTIVITYLOGS", "db_Alpha", "", 2147483647);
		// AppUI5.createField("App_ProcessDate", "Process Date", "@APP_ACTIVITYLOGS", "db_Alpha", "", 321474836470);
		//AppUI5.createField("App_Status", "Status", "@APP_ACTIVITYLOGS", "db_Alpha", "", 100);
		}
	});
  });
  