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
], function(Controller) {
  "use strict";

  return Controller.extend("com.apptech.app-bankinteg.controller.Main", {

    onInit: function () {
			//this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			// this.model.setData(this.data);
			// this.getView().setModel(this.model);
			//PLACE HOLDER OF PROJECT OBJECT
				this.DB = sap.ui.getCore().getModel("Database");
			this.oMdlMenu = new JSONModel("model/menus.json");
			this.getView().setModel(this.oMdlMenu);

			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo("Dashboard");
    },
    
    //-------------------------------------------
		onRoutePatternMatched: function (event) {
			var key = event.getParameter("name");
			this.byId("childViewSegmentedButton").setSelectedKey(key);
		},

		onAfterShow: function (router) {
			router.navTo("Dashboard");
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
			this.router.navTo("Dashboard");
		},

		onItemSelect: function (oEvent) {
			var sSelectedMenu = oEvent.getSource().getProperty("selectedKey");
			switch (sSelectedMenu) {
			case "paymentprocessing":
				this.router.navTo("PaymentProcessing");
				break;
			case "paymentfileextration":
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
		onLogout: function (){ 
		
			$.ajax({
				url: "https://18.136.35.41:50000/b1s/v1/Logout",
				type: "POST",
				error: function (xhr, status, error) {
					MessageToast.show("Invalid Credentials");
				},
				context:this,
				success: function (json) {
					sap.m.MessageToast.show("Session End"); 
					jQuery.sap.storage.Storage.clear();	
					sap.ui.core.UIComponent.getRouterFor(this).navTo("Login", null, true);
					// AppUI5.Logout();
					         
				}
			});
		},
		onLoadUDTandUDF: function(){
			this.loadUDandUDF();
		},
		loadUDandUDF:function(){
			//create udt
			//Payement Processing Draft  Header
			AppUI5.createTable("APP_OPPD", "Payment Processing", "bott_NoObject");
			//Payement Processing Details
			AppUI5.createTable("APP_PPD1", "Payment Processing", "bott_NoObject");
			//Saved Draft OutGoing Payment
			AppUI5.createTable("APP_ODOP", "Payment Processing", "bott_NoObject");
			//create udf
			//Payement Processing Header
			AppUI5.createField("App_DocNum", "Document Number", "@APP_OPPD", "db_Alpha", "", 30);
			AppUI5.createField("App_DateFrom", "Date From", "@APP_OPPD", "db_Alpha", "", 30);
			AppUI5.createField("App_DateTo", "Date To", "@APP_OPPD", "db_Alpha", "", 30);
			AppUI5.createField("App_Suppliercode", "Supplier Code", "@APP_OPPD", "db_Alpha", "", 30);
			AppUI5.createField("App_SupplierName", "Supplier Name", "@APP_OPPD", "db_Alpha", "", 30);
			AppUI5.createField("App_TaggingDate", "Tagging Date", "@APP_OPPD", "db_Alpha", "", 30);
			AppUI5.createField("App_Status", "Status", "@APP_OPPD", "db_Alpha", "", 30);
			AppUI5.createField("App_Remarks", "Remarks", "@APP_OPPD", "db_Alpha", "", 250);
			AppUI5.createField("App_CreatedBy", "Created By", "@APP_OPPD", "db_Alpha", "", 30);
			AppUI5.createField("App_CreatedDate", "Created Date", "@APP_OPPD", "db_Alpha", "", 30);
			AppUI5.createField("App_UpdatedBy", "Updated By", "@APP_OPPD", "db_Alpha", "", 30);
			AppUI5.createField("App_UpdatedDate", "Updated Date", "@APP_OPPD", "db_Alpha", "", 30);
			//Payement Processing Details
			AppUI5.createField("App_DocNum", "Document Number", "@APP_PPD1", "db_Alpha", "", 30);
			AppUI5.createField("App_Priority", "Priority", "@APP_PPD1", "db_Alpha", "", 30);
			AppUI5.createField("App_InvoiceNo", "Invoice Number", "@APP_PPD1", "db_Alpha", "", 20);
			AppUI5.createField("App_InvDocNum", "Invoice DocNum", "@APP_PPD1", "db_Alpha", "", 25);
			AppUI5.createField("App_InvoiceType", "Invoice Type", "@APP_PPD1", "db_Alpha", "", 25);
			AppUI5.createField("App_InvoiceDate", "Invoice Date", "@APP_PPD1", "db_Alpha", "", 30);
			AppUI5.createField("App_CheckDate", "Check Date", "@APP_PPD1", "db_Alpha", "", 30);
			AppUI5.createField("App_SuppRefNo", "Supplier Reference No", "@APP_PPD1", "db_Alpha", "", 25);
			AppUI5.createField("App_Remarks", "Remarks", "@APP_PPD1", "db_Alpha", "", 250);
			AppUI5.createField("App_InvoiceType", "Invoice Type", "@APP_PPD1", "db_Alpha", "", 10);
			AppUI5.createField("App_Desc", "Description", "@APP_PPD1", "db_Alpha", "", 250);
			AppUI5.createField("App_InvoiceCur", "Invoice Currency", "@APP_PPD1", "db_Alpha", "", 30);
			AppUI5.createField("App_InvoiceTotal", "InvoiceTotal", "@APP_PPD1", "db_Float", "st_Sum", 30);
			AppUI5.createField("App_RemainingBal", "RemainingBal ", "@APP_PPD1", "db_Float", "st_Sum", 30);
			AppUI5.createField("App_PaymentAmount", "PaymentAmount ", "@APP_PPD1", "db_Float", "st_Sum", 30);
			AppUI5.createField("App_CRANo", "CRA Number", "@APP_PPD1", "db_Alpha", "", 30);
			AppUI5.createField("App_LineNumber", "PaymentAmount ", "@APP_PPD1", "db_Numeric", "", 30);
			AppUI5.createField("App_CreatedBy", "Created By", "@APP_PPD1", "db_Alpha", "", 30);
			AppUI5.createField("App_CreatedDate", "Created Date", "@APP_PPD1", "db_Alpha", "", 30);
			AppUI5.createField("App_UpdatedBy", "Updated By", "@APP_PPD1", "db_Alpha", "", 30);
			AppUI5.createField("App_UpdatedDate", "Updated Date", "@APP_PPD1", "db_Alpha", "", 30);
			// Saved Draft OutGoing Payment
			AppUI5.createField("App_DocEntry", "Document Entry", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_DocNum", "Batch Number", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_PNBPrntBrnch", "PNB Printing Branch", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_DistPatchTo", "Dispatch To", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_DispatchCode", "Dispatch Code", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_DispatchName", "Dispatch Name", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_PNBAccountNo", "PNB Account No", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_PNBAccountName", "PNB Account Name", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_Remarks", "Remarks", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_CreatedBy", "Created By", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_CreatedDate", "Created Date", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_UpdatedBy", "Updated By", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_UpdatedDate", "Updated Date", "@APP_ODOP", "db_Alpha", "", 30);
			AppUI5.createField("App_Status", "Status", "@APP_ODOP", "db_Alpha", "", 30);
    }
    

  });
});
