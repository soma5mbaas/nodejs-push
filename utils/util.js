
function getAPIInfo( req ) {
	var api = {};

	if( api.id = req.get('Rest-API-Id') ) {
		api.type = 'rest';
	} else if( api.id = req.get('Android-API-Id') ) {
		api.type = 'android';
	} else if( api.id = req.get('Ios-API-Id') ) {
		api.type = 'ios';
	} else if( api.id = req.get('Javascript-API-Id') ) {
		api.type = 'javascript';
	}

	return api;
};

exports.getHeader = function( req ) {
	var header = {};

	// 기본 정보 
	header.applicationId = req.get('Application-Id');
	header.api = getAPIInfo( req );
	header.timestamp = Date.now();

	// 옵션 정보
	if( req.params.classname ) header.class = req.params.classname;
	if( req.params._id ) header._id = req.params._id;  

	return header;
};

exports.sendError = function(res, errorCode) {
	res.status( errorCode.status ).json( errorCode.info );
};

// json의 schema와 데이터 타입을 배열로 만들어 리턴한다.
exports.exportSchema = function( object ) {
	var properties = Object.keys( object );
	var schema = [];

	for(var i = 0; i < properties.length; i++) {
		var property = properties[i];
		var value = object[property];

		var type = typeof value;

		if( type === 'object' && Array.isArray(value) ) {
			type = 'array';
		}
		 else if( type === 'object' && Object.prototype.toString.call(value) === '[object Date]' ) {
			type = 'date';
		}	

		schema.push( property + '.' + type );
	}

	return schema;
};

// JSON objejct 의 value 를 string 으로 parsing 한다.
exports.parseToString = function( json ) {
	var properties = Object.keys( json );
	var newJson = {};
	properties.forEach(function(property) {
		newJson[property] = json[property].toString();
	});

	return newJson;
};

exports.deepCopy = function(object) {
	var newObject = Object.keys(object).reduce(function (obj, item) {
		obj[item] = object[item];
		return obj;
	},{});

	return newObject;
};

exports.isEmptyObject = function(object) {
	return JSON.stringify(object) == '{}';
};