"use strict"

var pjson = require('../package.json');
var jsonio = require('jsonfile');
var _ = require('lodash');
var clc = require('cli-color');
var program = require('commander');

/**
 * Read stored settings or create empty
 */
try {
    var settings = require('../settings.json');
} catch (e) {
    var settings = {
    	items: []
    }
}

/**
 * Set version number
 */
program
	.version(pjson.version);

/**
 * List all todos
 */
program
	.command('list')
	.description('list all todos')
	.option('-a, --active', 'list only active todos')
	.option('-c, --completed', 'list only completed todos')
	.action(list);

/**
 * Create new todo
 */
program
	.command('add <title>')
	.description('add new todo')
	.action(add);

/**
 * Mark todo completed
 */
program
	.command('check <id>')
	.description('mark todo completed')
	.action(check);

/**
 * Mark todo active
 */
program
	.command('uncheck <id>')
	.description('mark todo active')
	.action(uncheck);

/**
 * Clear todos
 */
program
	.command('clear [id]')
	.description('clear all completed todos or by id')
	.option('-a, --all', 'clear all todos')
	.action(clear);

/**
 * Start parsing arguments
 */
program.parse(process.argv);

/**
 * Output help by default if no args was provided
 */
if (!process.argv.slice(2).length) {
	program.outputHelp();
}

/**
 * List collection of todos in console
 * @param  {object} input option args
 */
function list(options){
	// Collection of filtered items based on options
	var filteredItems = options.active ? 
							_.filter(settings.items, function(item){ return !item.completed }) 
						: 
							options.completed ?
								_.filter(settings.items, function(item){ return item.completed }) 
							:
								settings.items ;

	// Return early on empty collection
	if(!filteredItems.length)
		return console.log('\n  Your todo list is empty \n');

	// Output collection
	console.log('');
	console.log(clc.yellow('  Todos:'));
	console.log('');
	_.each(filteredItems, function(item, index){
		item.completed ? console.log(clc.green('    ✓ ') + clc.yellow(item.id) + '. ' + item.title) : console.log('      ' + clc.yellow(item.id) + '. ' + item.title);
	});
	console.log('');
}

/**
 * Add new todo to existing collection
 * @param {string} title for the new todo
 */
function add(title){
	var id = settings.items.length ? _.max(_.pluck(settings.items, "id")) + 1 : 1;
	
	// Push todo to items array and save
	settings.items.push({ id: id, title: title, completed: false });
	return save('New todo added');
}

/**
 * Mark todo completed
 * @param {number} id of todo
 */
function check(id){
	// Find todo by id
	var todo = _.find(settings.items, function(item){
		return item.id == id;
	});

	// Save and return
	if(todo){
		todo.completed = true;
		return save('Todo with id: ' + id + ' marked completed');
	} else {
		return save('Todo with id: ' + id + ' not found');
	}
}

/**
 * Mark todo active
 * @param {number} id of todo
 */
function uncheck(id){
	// Find todo by id
	var todo = _.find(settings.items, function(item){
		return item.id == id;
	});

	// Save and return
	if(todo){
		todo.completed = false;
		return save('Todo with id: ' + id + ' marked active');
	} else {
		return save('Todo with id: ' + id + ' not found');
	}
}

/**
 * Clear all todos or by id
 * @param  {number} id of todo
 * @param  {object} input option args
 */
function clear(id, options){
	if(id){
		// Remove todo by id from collection
		var filteredItems = _.filter(settings.items, function(item){
			return item.id != id;
		});
		if(_.isMatch(filteredItems, settings.items)) return save('Todo with id: ' + id + ' not found');
		settings.items = filteredItems;
		return save('Todo with id: ' + id + ' cleared');
	} else {
		if(options.all){
			// Clear all todos
			settings.items = [];
			return save('All todos cleared');
		} else {
			// Clear only completed todos
			settings.items = _.filter(settings.items, function(item){ return !item.completed });
			return save('All completed todos cleared');
		}
	}
}

/**
 * Save changes to json file
 * @param {string} console output
 */
function save(log) {
	// Save changes to json file
	jsonio.writeFileSync(__dirname + '/../settings.json', settings);
	return console.log('\n  ' + log + ' \n');
}

exports.program = program;