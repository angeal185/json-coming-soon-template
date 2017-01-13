var json2html = {
	
	/* ---------------------------------------- Public Methods ------------------------------------------------ */
	'transform': function(json,transform,_options) {
		
		//create the default output
		var out = {'events':[],'html':''};
		
		//default options (by default we don't allow events)
		var options = {
			'events':false
		};
		
		//extend the options
		options = json2html._extend(options,_options);

		//Make sure we have a transform & json object
		if( transform !== undefined || json !== undefined ) {

			//Normalize strings to JSON objects if necessary
			var obj = typeof json === 'string' ? JSON.parse(json) : json;
			
			//Transform the object (using the options)
			out = json2html._transform(obj, transform, options);
		}
		
		//determine if we need the events
		// otherwise return just the html string
		if(options.events) return(out);
			else return( out.html );
	},
	
	/* ---------------------------------------- Private Methods ------------------------------------------------ */
	
	//Extend options
	'_extend':function(obj1,obj2){
		var obj3 = {};
		for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
		for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
		return obj3;
	},
	
	//Append results
	'_append':function(obj1,obj2) {
		var out = {'html':'','event':[]};
		if(typeof obj1 !== 'undefined' && typeof obj2 !== 'undefined') {
			out.html = obj1.html + obj2.html;

			out.events = obj1.events.concat(obj2.events);
		}

		return(out);
	},

	//isArray (fix for IE prior to 9)
	'_isArray':function(obj) {
		return Object.prototype.toString.call(obj) === '[object Array]';
	},
	
	//Transform object
	'_transform':function(json, transform, options) {
		
		var elements = {'events':[],'html':''};
		
		//Determine the type of this object
		if(json2html._isArray(json)) {
			
			//Itterrate through the array and add it to the elements array
			var len=json.length;
			for(var j=0;j<len;++j) {	
				//Apply the transform to this object and append it to the results
				elements = json2html._append(elements,json2html._apply(json[j], transform, j, options));
			}

		} else if(typeof json === 'object') {

			//Apply the transform to this object and append it to the results
			elements = json2html._append(elements,json2html._apply(json, transform, undefined, options));
		}

		//Return the resulting elements
		return(elements);		
	},

	//Apply the transform at the second level
	'_apply':function(obj, transform, index, options) {

		var element = {'events':[],'html':''};
		
		//Itterate through the transform and create html as needed
		if(json2html._isArray(transform)) {
			
			var t_len = transform.length;
			for(var t=0; t < t_len; ++t) {
				//transform the object and append it to the output
				element = json2html._append(element,json2html._apply(obj, transform[t], index, options));
			}

		} else if(typeof transform === 'object') {
            
            var _element = '<>';
            
            //Add legacy support for tag
            if(transform[_element] === undefined) _element = 'tag';
            
			//Check to see if we have a valid element name
			if( transform[_element] !== undefined ) {

                //Get the element name (this can be tokenized)
				var name = json2html._getValue(obj,transform,_element,index);
                
				//Create a new element
				element.html += '<' + name;

				//Create a new object for the children
				var children = {'events':[],'html':''};
				
				//innerHTML
				var html;

				//Look into the properties of this transform
				for (var key in transform) {

					switch(key) {
						
						//LEGACY support for tag
						case 'tag':
						case '<>':
							//Do nothing as we have already created the element
						break;

						//LEGACY support for children
						case 'children':
						case 'html':

							//Get the transform value associated with this key
							// added as key could be children or html
							var _transform = transform[key];

							//Determine what kind of object this is
							// array & function => children
							// other => html
							if(json2html._isArray(_transform)) {
                                
								//Apply the transform to the children
								children = json2html._append(children,json2html._apply(obj, _transform, index, options));
							} else if(typeof _transform === 'function') {
								
								//Get the result from the function
								var temp = _transform.call(obj, obj, index);

								//Determine what type of object was returned
								switch(typeof temp){

									//Only returned by json2html.transform or $.json2html calls
									case 'object':
										//make sure this object is a valid json2html response object
										// we ignore all other objects (since we don't know how to represent them in html)
										if(temp.html !== undefined && temp.events !== undefined) children = json2html._append(children,temp);
									break;
									
									//Not supported
									case 'function':
									case 'undefined':
									break; 

									//Append to html
									// string, number, boolean
									default:
										children.html += temp;
									break;
								}
							} else {
								
								//Create the html attribute for this element
								html = json2html._getValue(obj,transform,key,index);
							}
						break;

						default:
							//Add the property as a attribute if it's not a key one
							var isEvent = false;
							
							//Check if the first two characters are 'on' then this is an event
							if( key.length > 2 )
								if(key.substring(0,2).toLowerCase() == 'on') {
									
									//Determine if we should add events
									if(options.events) {

										//if so then setup the event data
										var data = {
											'action':transform[key],
											'obj':obj,
											'data':options.eventData,
											'index':index
										};
										
										//create a new id for this event
										var id = json2html._guid();

										//append the new event to this elements events
										element.events[element.events.length] = {'id':id,'type':key.substring(2),'data':data};

										//Insert temporary event property (json2html-event-id) into the element
										element.html += " json2html-event-id-"+key.substring(2)+"='" + id + "'";
									}
									//this is an event
									isEvent = true;
								}

							//If this wasn't an event AND we actually have a value then add it as a property
							if( !isEvent){
								//Get the value
								var val = json2html._getValue(obj, transform, key, index);
								
								//Make sure we have a value
                                if(val !== undefined) {
                                    var out;
                                    
                                    //Determine the output type of this value (wrap with quotes)
                                    if(typeof val === 'string') out = '"' + val.replace(/"/g, '&quot;') + '"';
                                    else out = val;
                                    
                                    //create the name value pair
                                    element.html += ' ' + key + '=' + out;
                                }
							}
						break;
					}
				}
			
				//close the opening element
				element.html += '>';
				
				//add the innerHTML (if we have any)
				if(html) element.html += html;

				//add the children (if we have any)
				element = json2html._append(element,children);

				//add the closing element
				element.html += '</' + name + '>';
			}
		}
		
		//Return the output object
		return(element);
	},

	//Get a new GUID (used by events)
	'_guid':function() {
		var S4 = function() {
		   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
		};
		return (S4()+S4()+"-"+S4()+S4()+"-"+S4()+S4());
	},

	//Get the html value of the object
	'_getValue':function(obj, transform, key,index) {
		
		var out = '';
		
		var val = transform[key];
		var type = typeof val;
		
		if (type === 'function') {
			return(val.call(obj,obj,index));
		} else if (type === 'string') {
			var _tokenizer = new json2html._tokenizer([
				/\$\{([^\}\{]+)\}/
			],function( src, real, re ){
				return real ? src.replace(re,function(all,name){
					
					//Split the string into it's seperate components
					var components = name.split('.');

					//Set the object we use to query for this name to be the original object
					var useObj = obj;

					//Output value
					var outVal = '';
					
					//Parse the object components
					var c_len = components.length;
					for (var i=0;i<c_len;++i) {

						if( components[i].length > 0 ) {

							var newObj = useObj[components[i]];
							useObj = newObj;
							if(useObj === null || useObj === undefined) break;
						}
					}
					
					//As long as we have an object to use then set the out
					if(useObj !== null && useObj !== undefined) outVal = useObj;

					return(outVal);
				}) : src;
			});
			
			out = _tokenizer.parse(val).join('');
		} else {
			out = val;
		}

		return(out);
	},
	
	//Tokenizer
	'_tokenizer':function( tokenizers, doBuild ){

		if( !(this instanceof json2html._tokenizer ) )
			return new json2html._tokenizer( tokenizers, doBuild );
			
		this.tokenizers = tokenizers.splice ? tokenizers : [tokenizers];
		if( doBuild )
			this.doBuild = doBuild;

		this.parse = function( src ){
			this.src = src;
			this.ended = false;
			this.tokens = [ ];
			do {
				this.next();
			} while( !this.ended );
			return this.tokens;
		};
		
		this.build = function( src, real ){
			if( src )
				this.tokens.push(
					!this.doBuild ? src :
					this.doBuild(src,real,this.tkn)
				);	
		};

		this.next = function(){
			var self = this,
				plain;
				
			self.findMin();
			plain = self.src.slice(0, self.min);
			
			self.build( plain, false );
				
			self.src = self.src.slice(self.min).replace(self.tkn,function( all ){
				self.build(all, true);
				return '';
			});
			
			if( !self.src )
				self.ended = true;
		};

		this.findMin = function(){
			var self = this, i=0, tkn, idx;
			self.min = -1;
			self.tkn = '';
			
			while(( tkn = self.tokenizers[i++]) !== undefined ){
				idx = self.src[tkn.test?'search':'indexOf'](tkn);
				if( idx != -1 && (self.min == -1 || idx < self.min )){
					self.tkn = tkn;
					self.min = idx;
				}
			}
			if( self.min == -1 )
				self.min = self.src.length;
		};
	}
};


/*  jquery  */
(function($){	

    //Alias for json2html.transform
	// _options 
	//   output : json2html | html | jquery
    $.json2html = function(json, transform, _options) {
        
        //Make sure we have the json2html base loaded
        if(typeof json2html === 'undefined') return(undefined);

		//Default Options
        var options = {
            'output':'json2html'
        };

		//Extend the options (with defaults)
        if( _options !== undefined ) $.extend(options, _options);

		switch(options.output){

			//Process the transform with events
			// for consumption within a json2html html attribute function call 
			// returns an object {'html':html,'events'[]}
			case 'json2html':

				//make sure we have the events set as true
				options.events = true;

				return(json2html.transform(json, transform, options));
			break;

			//Return raw html (same as calling json2html.transform
			case 'html':

				//make sure we have the events set as false (to get html)
				options.events = false;
				
				return(json2html.transform(json, transform, options));
			break;
		
			//Return a jquery object
			case 'jquery':

				//make sure we have the events set as true
				options.events = false;

				//let json2html core do it's magic
				// and then process any jquery events
				var $result = json2html_events(json2html.transform(json, transform, options));

				//return the jquery object
				return($result);
			break;
		}
    };

	//Chaining method
	$.fn.json2html = function(json, transform, _options) {
    
        //Make sure we have the json2html base loaded
        if(typeof json2html === 'undefined') return(undefined);
    
        //Default Options
        var options = {
            'append':true,
            'replace':false,
            'prepend':false,
            'eventData':{}
        };
    
        //Extend the options (with defaults)
        if( _options !== undefined ) $.extend(options, _options);
        
        //Insure that we have the events turned (Required)
        options.events = true;
        
        //Otherwise we're running $().json2html
        return this.each(function(){ 
            
            //let json2html core do it's magic
            // and then process any jquery events
            var $result = json2html_events(json2html.transform(json, transform, options));

            //Append it to the appropriate element
            if (options.replace) $.fn.replaceWith.call($(this),$result);
            else if (options.prepend) $.fn.prepend.call($(this),$result);
            else $.fn.append.call($(this),$result);
        });
    };
})(jQuery);


function json2html_events(result) {

	//Attach the html(string) result to the DOM
	var dom = $(document.createElement('i')).html(result.html);
	
	//Determine if we have events
	for(var i = 0; i < result.events.length; i++) {
		
		var event = result.events[i];
		
		//find the associated DOM object with this event
		var obj = $(dom).find("[json2html-event-id-"+event.type+"='" + event.id + "']");
		
		//Check to see if we found this element or not
		if(obj.length === 0) throw 'jquery.json2html was unable to attach event ' + event.id + ' to DOM';
		
		//remove the attribute
		$(obj).removeAttr('json2html-event-id-'+event.type);
		
		//attach the event
		$(obj).on(event.type,event.data,function(e){
			//attach the jquery event
			e.data.event = e;
			
			//call the appropriate method
			e.data.action.call($(this),e.data);
		});
	}
	
	//Get the children to this result
	return($(dom).children());
}