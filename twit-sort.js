'use strict';
var inquirer = require('inquirer');
var fs = require('fs');
var chalk = require('chalk');
var json2csv = require('json2csv');

// Output formats
// JSON
// CSV

// TODO - scrape users from web page
var scrapeUsers = function() {

};

// TODO - user twitter api to get users
var getUsers = function() {

};


// Defaults
var outputFormat = 'CSV';

var inputJsonFile = 'twitter-contacts.json';

var choices = ['Personal', 'Frontend', 'Backend', 'Web'];
var lists = {};

for (var choice of choices) {
	lists[choice] = [];
}

choices.push(new inquirer.Separator());
choices.push('Skip');
choices.push('Quit');

var prompt = function(users, cb) {
	var user = users.shift();

	console.log('-----');
	console.log(`${chalk.bold('Full Name:')} ${user.fullname}`);
	console.log(`${chalk.bold('Username:')} ${user.username}`);
	console.log(`${chalk.bold('Bio:')} ${user.bio}`);
	console.log('-----');
	console.log();

	return new Promise((resolve, reject) => {
		inquirer.prompt([{
			type: 'list',
			name: 'choice',
			message: `Which list would you like to place ${chalk.blue(user.username)} in?`,
			choices: choices
		}]).then(function (answers) {
			cb(answers, user);

			if(users.length > 0) {
				prompt(users, cb);
			} else {
				resolve();
			}
		});
	});
};

var writeListsToFiles = function(lists) {
	let promises = [];

	for (let list in lists) {
		promises.push(writeListToFile(list));
	}

	return new Promise((resolve, reject) => {
		Promise
			.all(promises)
			.then(()=>{
				resolve();
			});
	});
};

// TODO
var writeListToFile = function(list) {
	return new Promise((resolve, reject) => {
		switch (outputFormat) {
		case 'CSV':
			try {
				var result = json2csv({ data: list, fields: ['fullname', 'username', 'bio'] });
				console.log(result);
			} catch (err) {
				console.error(err);
				reject();
			}
			break;
		default:
			break;

		}
		console.log('Raw:', JSON.stringify(lists));
		resolve();
	});
};


fs.readFile(inputJsonFile, 'utf8', (err, data) => {
	if (err) throw err;

	try {
		var users = JSON.parse(data);
	} catch (e) {
		console.log('Error parsing JSON', e.message);
		return;
	}

	prompt(users, (answers, user) => {
		if(answers.choice === 'Quit') {
			console.log('Quit!');

			writeListsToFiles(lists).then(()=>{
				process.exit();
			});

		}

		if(answers.choice === 'Skip') {
			console.log(`Skipped ${user.username}`);
		}

		if(answers.choice !== 'Skip') {
			console.log(`Adding ${user.username} to ${answers.choice}`);

			lists[answers.choice].push(user);
		}
	}).then(() => {
		writeListsToFiles(lists).then(()=>{
			process.exit();
		});
	});

});
