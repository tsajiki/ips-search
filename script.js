window.onload = function () {
	const table = document.querySelector("main table tbody");
	// const keyword_input = document.querySelector("input[type=\"text\"]");
	const keyword_input1 = document.querySelector("#input1");
	const keyword_input2 = document.querySelector("#input2");
	const keyword_input3 = document.querySelector("#input3");
	const form = document.getElementsByTagName("form")[0];
	const downloadLink = document.getElementById("download");

	// checkbox
	// const checkVolume = document.getElementById("check-volume");
	const checkName = document.getElementById("check-name");
	const checkTitle = document.getElementById("check-title");
	const checkRemarks = document.getElementById("check-remarks");

	// if the device is iOS, displayed lines are limited 500.
	const isIOS = ["iPhone", "iPad", "iPod"].some(name => navigator.userAgent.indexOf(name) > -1);
	const lineLimit = 500;

	let covers = null;
	let contents = null;
	let timeout = void 0;

	keyword_input1.addEventListener("keydown", (evt) => {
		const KEYCODE_ENTER = 13;
		if (evt.keyCode === KEYCODE_ENTER) {
			evt.preventDefault();
			search(evt);
		}
	});

	// display a line of the table
	const createLine = (cover, line) => {
		let tr = document.createElement("tr");
		table.appendChild(tr);

		tr.innerHTML += `<td>${cover[3]}</td>`;
		tr.innerHTML += `<td>${line[0]}</td>`;
		tr.innerHTML += `<td>${line[1]}</td>`;
		tr.innerHTML += `<td>${line[3]}</td>`;
		tr.innerHTML += `<td>${line[4]}</td>`;
		tr.innerHTML += `<td>${line[5]}</td>`;
		// tr.innerHTML += `<td>${line[6]}</td>`;
		tr.innerHTML += `<td>${line[7]}</td>`;
	}

	// update the table
	const updateTable = (options, index, displayedIndex) => {
		let regex = new RegExp(options.keyword, "igu");

		index = typeof index === 'undefined' ? 0 : index;
		displayedIndex = typeof displayedIndex === "undefined" ? 0 : displayedIndex;

		if (isIOS && displayedIndex >= lineLimit)
			return;

		for (; ;) {
			const line = contents[index];

			if (typeof line === 'undefined') {
				return;
			}

			// keyword
			// let matchesName = checkName.checked ? line[3].match(regex) == null : true;
			// let matchesTitle = checkTitle.checked ? line[4].match(regex) == null : true;
			// let matchesRemarks = checkRemarks.checked ? line[7].match(regex) == null : true;

			// let matchesKeyword = options.keyword != "" &&
			// (matchesName && matchesTitle && matchesRemarks);

			let matchesName = checkName.checked ? line[3].match(regex) != null : false;
			let matchesTitle = checkTitle.checked ? line[4].match(regex) != null : false;
			let matchesRemarks = checkRemarks.checked ? line[7].match(regex) != null : false;

			let matchesKeyword = matchesName || matchesTitle || matchesRemarks;


			// if (matchesKeyword) {
			// 	index++;
			// 	continue;
			// }

			// if (options.keyword != "") {
			// 	index++;
			// 	continue;
			// }

			// if (keyword_input2.value != "" && Number(line[0]) < keyword_input2.value) {
			// 	index++;
			// 	continue;
			// }

			// if (keyword_input3.value != "" && Number(line[0]) > keyword_input3.value) {
			// 	index++;
			// 	continue;
			// }

			// var cover = covers.find((n) => n[2] == line[0]);

			// console.log('発行年: %s 通巻号数: %s',cover[3],cover[2]);

			if (options.keyword != "" && !matchesKeyword) {
				index++;
				continue;
			}

			if (keyword_input2.value != "" && Number(line[0]) < keyword_input2.value) {
				index++;
				continue;
			}

			if (keyword_input3.value != "" && Number(line[0]) > keyword_input3.value) {
				index++;
				continue;
			}

			var cover = covers.find((n) => n[2] == line[0]);

			if (typeof cover === 'undefined') {
				index++;
				continue;
			}

			createLine(cover, line);
			timeout = setTimeout(() => updateTable(options, index + 1, ++displayedIndex), 0);
			break;
		}
	}

	// convert table data to CSV file with utf-8 BOM
	const makeCSV = (a, table_, filename) => {
		var escaped = /,|\r?\n|\r|"/;
		var e = /"/g;

		var bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
		var csv = [], row = [], field, r, c;
		for (r = 0; r < table_.rows.length; r++) {
			row.length = 0;
			for (c = 0; c < table_.rows[r].cells.length; c++) {
				field = table_.rows[r].cells[c].innerText.trim();
				row.push(escaped.test(field) ? '"' + field.replace(e, '""') + '"' : field);
			}
			csv.push(row.join(','));
		}
		var blob = new Blob([bom, csv.join('\n')], { 'type': 'text/csv' });

		if (window.navigator.msSaveBlob) {
			// IE
			window.navigator.msSaveBlob(blob, filename);
		} else {
			a.download = filename;
			a.href = window.URL.createObjectURL(blob);
		}
	}

	// download CSV file: `ips_YYYYMMDDhhmmdd.csv`
	const downloadCSV = () => {
		makeCSV(
			downloadLink, document.querySelector("main table"), `ips_${getDateString()}.csv`);
	}

	// get YYYYMMDDhhmmdd
	const getDateString = () => {
		let date = new Date();
		let Y = date.getFullYear();
		let M = ("00" + (date.getMonth() + 1)).slice(-2);
		let D = ("00" + date.getDate()).slice(-2);
		let h = ('0' + date.getHours()).slice(-2);
		let m = ('0' + date.getMinutes()).slice(-2);
		let d = ('0' + date.getSeconds()).slice(-2);

		return Y + M + D + h + m + d;
	}

	// search
	const search = (e) => {
		// clear tbody contents
		table.innerHTML = '';

		if (e !== null) {
			e.stopPropagation();
		}
		let options = {};

		if (keyword_input1.value === ''　&&
			keyword_input2.value === '' &&
			keyword_input3.value === '')
			return;
		options.keyword = keyword_input1.value;
		// keyword_input2
		// console.log(keyword_input2.value);

		clearTimeout(timeout);

		updateTable(options);
	}

	let submit = document.getElementById("submit");
	submit.onclick = search;
	downloadLink.onclick = downloadCSV;

	fetch("Covers.json")
		.then(response => response.json())
		.then(json => { covers = json; search(null); });

	fetch("Contents.json")
		.then(response => response.json())
		.then(json => { contents = json; search(null); });
};
