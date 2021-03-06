var APP = require("core");
var Q = require('q');

exports.definition = {
config: {
    "URL": "https://api.parse.com/1/installations",
    //"debug": 1,
    "adapter": {
            "type": "restapi",
            "collection_name": "Installation",
            "idAttribute": "objectId"
        },
    "headers": { // your custom headers
            "X-Parse-Application-Id" : Ti.App.Properties.getString('Parse_AppId'),
            "X-Parse-REST-API-Key" : Ti.App.Properties.getString('Parse_RestKey'),
            "Content-Type" : "application/json"
        }
    },
	extendModel: function(Model) {
		_.extend(Model.prototype, {
			_parse_class_name: "Installation",

			// //Installtion_objectId
			// getById : function (id) {
			// 	this.set('id', id);
			// 	return this._getBy({});
			// },
            getByObjectId : function (objectId) {
                var self = this;
                var deferred = Q.defer();
                Parse.Cloud.run('getInstallationByObjectId', {objectId : objectId }, {
            		success: function(_inst) {
                        //fetch와 비슷한결과를 얻기위해. this에 setset.
                        if(_inst){
                            self.set({'objectId':_inst.id, 'id':_inst.id}, {change:false});
                            self.set(_inst.attributes, {change:false});
                			deferred.resolve(self);
                        }else{
                            deferred.reject('not found installation by randomId: '+ randomId);
                        }
            		},
            		error: function(error) {
            			//TOOD[faith] : 이전값 저장해두었다가 되돌리는 코드가필요함.
            			return deferred.reject(error);
            		}
            	});

                return deferred.promise;
			},
			// getByRandomId : function (randomId) {
            //     var self = this;
            //     var deferred = Q.defer();
            //     //웹에서 테스트할때, 숫자로 전달하면 실패했음. 그래서 string..
            //     randomId = randomId ? randomId.toString() : randomId;
            //
            //     Parse.Cloud.run('getInstallationByRandomId', {randomId : randomId }, {
            // 		success: function(_inst) {
            //             //fetch와 비슷한결과를 얻기위해. this에 setset.
            //             if(_inst){
            //                 self.set({'objectId':_inst.id, 'id':_inst.id}, {change:false});
            //                 self.set(_inst.attributes, {change:false});
            //     			deferred.resolve(self);
            //             }else{
            //                 deferred.reject('not found installation by randomId: '+ randomId);
            //             }
            // 		},
            // 		error: function(error) {
            // 			//TOOD[faith] : 이전값 저장해두었다가 되돌리는 코드가필요함.
            // 			return deferred.reject(error);
            // 		}
            // 	});
            //
            //     return deferred.promise;
			// },
			changeChannels : function (channels) {
				if(!_.isArray(channels)) { channels = [channels]; }
				// Ti.API.debug('channels',channels,this.attributes)
				return this._save({'channels' :channels });
			},
			create : function (attributes) {
				// promise 사용
				return this._save(attributes);
			},
			//save
			_save : function (attributes) {
                var self = this;
				var deferred = Q.defer();
        // deviceToken이 업데이트 되면 에러 발생
        var tempInstallationM = Alloy.createModel('Installation');
				tempInstallationM.save(_.extend({'objectId': this.id},attributes), {
					success: function (result) {
						self.set(attributes, {change:false});
						deferred.resolve(self);
					},
					error : function (error) {
						deferred.reject(error);
					}
				});

				return deferred.promise;
			}
		});

	return Model;
	},
	extendCollection: function(Collection) {
	_.extend(Collection.prototype, {
	  // Extend, override or implement Backbone.Collection
		_parse_class_name: "Installation",
                // For Backbone v1.1.2, uncomment the following to override the
                // fetch method to account for a breaking change in Backbone.
                fetch: function(options) {
                        options = options ? _.clone(options) : {};
                        if(options.reset == null) options.reset = true;
                        return Backbone.Collection.prototype.fetch.call(this, options);
                },
		//objectIds를 가져옴
		getAll : function () {
			var deferred = Q.defer();

			this.fetch({
				success:function (res) { return deferred.resolve(res); },
				error:function (err) { return deferred.reject(err); }
			});

			return deferred.promise;
		}

	});

	return Collection;
	}
};


// helper
function _makeQuery(params) {
	return { where : JSON.stringify(params) };
}
