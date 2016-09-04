(function() {
	'use strict';

	var app = angular.module('application', [
		'ui.router',
		'ngAnimate',

		'base',
		'base.core',
		'dynamicRouting',
		'dynamicRouting.animations',
	])
		.config(mainModuleConfigFn)
		.run(mainModuleRunFn);

	function mainModuleConfigFn($urlProvider, $locationProvider) {

		$urlProvider.otherwise('/');

		$locationProvider.html5Mode({
			enabled: false,
			requireBase: false,
		});

		$locationProvider.hashPrefix('!');
	}

	mainModuleConfigFn.$inject = ['$urlRouterProvider', '$locationProvider'];

	// Use this method to register work which should be performed when the injector is done loading all modules.
	function mainModuleRunFn($rootScope) {

		// doc: https://github.com/ftlabs/fastclick
		/*
			FastClick is a simple, easy-to-use library for eliminating the 300ms delay between a physical tap and the firing of a click event on mobile browsers.
			The aim is to make your application feel less laggy and more responsive while avoiding any interference with your current logic.
		*/
		FastClick.attach(document.body);
	}

})();
