window.onload = function () {
	const table = document.querySelector("main table tbody");
	const keyword_input = document.querySelector("input[type=\"text\"]");
	const form = document.getElementsByTagName("form")[0];
	// const clearButton = document.getElementById("clear");
	const downloadLink = document.getElementById("download");

	// checkbox
	const checkVolume = document.getElementById("check-volume");
	const checkName = document.getElementById("check-name");
	const checkTitle = document.getElementById("check-title");
	const checkRemarks = document.getElementById("check-remarks");

	// if the device is iOS, displayed lines are limited 500.
	const isIOS = ["iPhone", "iPad", "iPod"].some(name => navigator.userAgent.indexOf(name) > -1);
	const lineLimit = 500;

	let data = null;
	let timeout = void 0;

	keyword_input.addEventListener("keydown", (evt) => {
		const KEYCODE_ENTER = 13;
		if (evt.keyCode === KEYCODE_ENTER) {
			evt.preventDefault();
			search(evt);
		}
	});

	// clearButton.addEventListener('click', (evt) => {
	// 	evt.stopPropagation();
	// 	keyword_input.value = "氏名";

	// 	checkVolume.checked = true;
	// 	checkName.checked = true;
	// 	checkTitle.checked = true;
	// 	checkRemarks.checked = true;
	// });

	// display a line of the table
	const createLine = (line) => {
		let tr = document.createElement("tr");
		table.appendChild(tr);

		// let url = `https://kdb.tsukuba.ac.jp/syllabi/2021/${line[0]}/jpn`;
		// let methods = ["対面", "オンデマンド", "同時双方向"].filter(it => line[10].indexOf(it) > -1);

		// tr.innerHTML += `<td>${line[0]}<br/>${line[1]}<br/><a href="${url}" class="syllabus" target="_blank">シラバス</a></td>`;
		// tr.innerHTML += `<td>${line[3]}単位<br/>${line[4]}年次</td>`;
		// tr.innerHTML += `<td>${line[5]}<br/>${line[6]}</td>`;
		// tr.innerHTML += `<td>${line[7].replace(/,/g, "<br/>")}</td>`;
		// tr.innerHTML += `<td>${line[8].replace(/,/g, "<br/>")}</td>`;

		tr.innerHTML += `<td>${line[0]}</td>`;
		tr.innerHTML += `<td>${line[1]}</td>`;
		// tr.innerHTML += `<td>${line[2]}</td>`;
		tr.innerHTML += `<td>${line[3]}</td>`;
		tr.innerHTML += `<td>${line[4]}</td>`;
		tr.innerHTML += `<td>${line[5]}</td>`;
		// tr.innerHTML += `<td>${line[6]}</td>`;
		tr.innerHTML += `<td>${line[7]}</td>`;
	}

	// update the table
	const updateTable = (options, index, displayedIndex) => {
		let regex = new RegExp(options.keyword);

		index = typeof index === 'undefined' ? 0 : index;
		displayedIndex = typeof displayedIndex === "undefined" ? 0 : displayedIndex;

		if (isIOS && displayedIndex >= lineLimit)
			return;

		for (; ;) {
			const line = data[index];

			if (typeof line === 'undefined') {
				return;
			}

			// keyword
			let matchesVolume = checkVolume.checked ? line[0].indexOf(options.keyword) != 0 : true;
			let matchesName = checkName.checked ? line[3].match(regex) == null : true;
			let matchesTitle = checkTitle.checked ? line[4].match(regex) == null : true;
			let matchesRemarks = checkRemarks.checked ? line[7].match(regex) == null : true;

			let matchesKeyword = options.keyword != "" &&
				(matchesVolume && matchesName && matchesTitle && matchesRemarks);

			// other options
			// let missMatchesSeason = options.season != "null" && line[5].indexOf(options.season) < 0;
			// let missMatchesModule = options.module_ != "null" && line[5].indexOf(options.module_) < 0;
			// let missMatchesDay = options.day != "null" && line[6].indexOf(options.day) < 0;
			// let missMatchesPeriod = options.period != "null" && line[6].indexOf(options.period) < 0;
			// let missMatchesOnline = options.online != "null" && line[10].indexOf(options.online) < 0;
			// let missMatchesReq_A = options.req_A != "null" && options.req_A != line[12];

			if (
				matchesKeyword) {
				// matchesKeyword ||
				// missMatchesSeason ||
				// missMatchesModule ||
				// missMatchesDay ||
				// missMatchesPeriod ||
				// missMatchesOnline ||
				// missMatchesReq_A) {
				index++;
				continue;
			}

			createLine(line);
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
				if (r !== 0 && c === 0) {
					field = field.slice(0, -5);
				}
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

	// download CSV file: `kdb_YYYYMMDDhhmmdd.csv`
	const downloadCSV = () => {
		makeCSV(
			downloadLink, document.querySelector("main table"), `kdb_${getDateString()}.csv`);
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

		if (keyword_input.value === '') return;
		options.keyword = keyword_input.value;

		clearTimeout(timeout);

		updateTable(options);
	}

	let submit = document.getElementById("submit");
	submit.onclick = search;
	downloadLink.onclick = downloadCSV;

	fetch("Contents0.json")
		.then(response => response.json())
		.then(json => { data = json; search(null); });
};
