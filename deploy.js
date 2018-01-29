
const kelda = require('kelda');

Deployment = function(options) {
	
	this.initialize(options);
};

Deployment.prototype = {
	
	initialize : function(options) {
		
		Object.assign(this, options);
		this.port = this.port || 80;
		this.scale = this.scale || 1;
		this.environment = {
			PORT: this.port.toString()
		};
		this.name = this.name || this.appname(this.repository);
		var dockerfile = this.dockerfile(this.repository);
		const image = new kelda.Image(this.name, dockerfile);
		this.containers = [];
		for (let i = 0; i < this.scale; i++) {
			this.containers.push(new kelda.Container(this.name, image, {
				command: this.command()
			}).withEnv(this.environment));
		}
		kelda.allow(kelda.publicInternet, this.containers, this.port);
		const infrastructure = kelda.baseInfrastructure();
		this.containers.forEach(function(container) {
			container.deploy(infrastructure);
		});
	},
	
	appname : function(repository) {
		
		let result = 'application';
		const index = repository.lastIndexOf('/');
		if (index !== -1) {
			result = repository.slice(index + 1);
		}
		return result;
	},
	
	dockerfile : function(repository) {
		
		var array = [];
		array.push('FROM node:8.9.4');
		array.push('RUN mkdir -p /usr/src/app');
		array.push('WORKDIR /usr/src/app');
		array.push('RUN git clone ' + repository + ' .');
		array.push('RUN npm install');
		return array.join('\r\n');
	},
	
	command : function() {
		
		if (true) {
			return ['npm', 'start'];
		} else {
			return ['tail', '-f', '/dev/null'];
		}
	}
};

const deployment = new Deployment({
	// name : 'application',
	repository: 'https://github.com/simplygreatwork/deployable.git',
	port : 80,
	scale: 1
});
