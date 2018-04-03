var canvas = null;

// =======================================================
// FUNCTIONS LIBRARY
// =======================================================
var fabFunctions = {

	// -------------------------------------------------------
	// INIT function
	// -------------------------------------------------------	
	init: function() {
	
		fabric.Object.prototype.transparentCorners = false;
	    fabric.Object.prototype.padding = 5;
	    	
		
		// ===============================================================================
	    // create my custom fabric classes
	    // ===============================================================================
	    
	    // ------------------------------------------------------ CustomText
	    fabric.CustomText = fabric.util.createClass(fabric.Textbox, {

	        type: 'CustomText', // if classname = 'CustomText' then the type MUST be 'CustomText'

	        initialize: function (element, options) {
	            options || ( options = { });
	            this.callSuper('initialize', element, options);
	            options && this.set('myid', options.myid);
	            options && this.set('myname', options.myname);
	            options && this.set('startframe', options.startframe);
	            options && this.set('durationframes', options.durationframes);
	            options && this.set('appeareffect', options.appeareffect);
	            options && this.set('disappeareffect', options.disappeareffect);
	            options && this.set('effectdurationappear', options.effectdurationappear);
	            options && this.set('effectdelayappear', options.effectdelayappear);
	            options && this.set('effecteasingappear', options.effecteasingappear);
	            options && this.set('effectdurationdisappear', options.effectdurationdisappear);
	            options && this.set('effectdelaydisappear', options.effectdelaydisappear);
	            options && this.set('effecteasingdisappear', options.effecteasingdisappear);
	        },

	        _render: function (ctx) {
	            this.callSuper('_render', ctx);
	        },
	        
	        toObject: function () {
	            return fabric.util.object.extend(this.callSuper('toObject'), {
	                myid: this.get("myid"),
	                myname: this.get("myname"),
	                startframe: this.get("startframe"),
	                durationframes: this.get("durationframes"),
	                appeareffect: this.get("appeareffect"),
	                disappeareffect: this.get("disappeareffect"),
	                effectdurationappear: this.get("effectdurationappear"),
	                effectdelayappear: this.get("effectdelayappear"),
	                effecteasingappear: this.get("effecteasingappear"),
	                effectdurationdisappear: this.get("effectdurationdisappear"),
	                effectdelaydisappear: this.get("effectdelaydisappear"),
	                effecteasingdisappear: this.get("effecteasingdisappear")
	            });
	        },

	    });


	    // SYNCHRONOUS
	    fabric.CustomText.fromObject = function (object, callback, forceAsync) {
	        return fabric.Object._fromObject('CustomText', object, callback, forceAsync, 'text');
	    }
	    
	    fabric.CustomText.async = false;
	    
	    // -------------------------------------------------------------------------------
	    
	    // ------------------------------------------------------ CustomImage
	    
	    fabric.CustomImage = fabric.util.createClass(fabric.Image, {

	        type: 'CustomImage', // if classname = 'CustomImage' then the type MUST be 'CustomImage'

	        initialize: function (element, options) {
	            options || ( options = { });
	            this.callSuper('initialize', element, options);
	            options && this.set('myid', options.myid);
	            options && this.set('myname', options.myname);
	            options && this.set('startframe', options.startframe);
	            options && this.set('durationframes', options.durationframes);
	            options && this.set('appeareffect', options.appeareffect);
	            options && this.set('disappeareffect', options.disappeareffect);
	            options && this.set('imagelink', options.imagelink);
	            options && this.set('effectdurationappear', options.effectdurationappear);
	            options && this.set('effectdelayappear', options.effectdelayappear);
	            options && this.set('effecteasingappear', options.effecteasingappear);
	            options && this.set('effectdurationdisappear', options.effectdurationdisappear);
	            options && this.set('effectdelaydisappear', options.effectdelaydisappear);
	            options && this.set('effecteasingdisappear', options.effecteasingdisappear);
	        },
	        
	        _render: function (ctx) {
	            this.callSuper('_render', ctx);
	        },

	        toObject: function () {
	            return fabric.util.object.extend(this.callSuper('toObject'), {
	                myid: this.get("myid"),
	                myname: this.get("myname"),
	                startframe: this.get("startframe"),
	                durationframes: this.get("durationframes"),
	                appeareffect: this.get("appeareffect"),
	                disappeareffect: this.get("disappeareffect"),
	                imagelink: this.get("imagelink"),
	                effectdurationappear: this.get("effectdurationappear"),
	                effectdelayappear: this.get("effectdelayappear"),
	                effecteasingappear: this.get("effecteasingappear"),
	                effectdurationdisappear: this.get("effectdurationdisappear"),
	                effectdelaydisappear: this.get("effectdelaydisappear"),
	                effecteasingdisappear: this.get("effecteasingdisappear")
	            });
	        },

	    });


	    fabric.CustomImage.fromObject = function(object, callback) {
	        fabric.util.loadImage(object.src, function(img) {
	            callback && callback(new fabric.CustomImage(img, object));
	        });
	    };
	    
	    fabric.CustomImage.async = true;
	    
	    fabric.CustomImage.fromURL = function (url, callback, options) {
	        fabric.util.loadImage(url, function (img) {
	            callback(new fabric.CustomImage(img, options));
	        }, null, options && options.crossOrigin);
	    };
	    
	    // -------------------------------------------------------------------------------
		
	    
	    // --------------------------------------
	    // INITIALIZE FABRIC CANVAS
	    // --------------------------------------
	    canvas = window.__canvas = new fabric.Canvas('surface');
	    
	    // >>>>>> see fabric.js at row 14730 for custom_attribute_array handling
	    canvas.custom_attribute_array = ["myid", "myname", "startframe", "durationframes", "appeareffect", "disappeareffect", "imagelink", "effectdurationappear", "effectdelayappear", "effecteasingappear", "effectdurationdisappear", "effectdelaydisappear", "effecteasingdisappear"];
    
	},
	
	// -------------------------------------------------------
	// PREPARE OBJECTS function
	// Read the project from indata input text, create objects 
	// in canvas
	// -------------------------------------------------------
	prepareObjects: function(wW, wH) {
		
		canvas.setWidth(wW);
		canvas.setHeight(wH);	
		
		var indata = document.getElementById('phantom_indata').value;
		
		console.log('Before loadFromJSON');
		
		canvas.loadFromJSON(indata, function() {
			console.log("loaded");
			canvas.renderAll();
			// do something else here if needed
		});
		console.log('Finishing loadFromJSON');
	},
	
	// -------------------------------------------------------
	// DOJOB function
	// Assign the frame to the outdata input text
	// -------------------------------------------------------
	doJob: function() {
		
		var dataUrl = canvas.toDataURL({format:'png'});
		document.getElementById('phantom_outdata').value = dataUrl;
		
	}
};