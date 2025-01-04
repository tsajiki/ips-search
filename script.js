window.onload = function () {
    const table = document.querySelector("main table tbody");
    const keywordInput1 = document.querySelector("#input1");
    const keywordInput2 = document.querySelector("#input2");
    const keywordInput3 = document.querySelector("#input3");
    const form = document.querySelector("form");
    const resultElement = document.getElementById("result");
    const downloadLink = document.getElementById("download");

    const isIOS = ["iPhone", "iPad", "iPod"].some(name => navigator.userAgent.indexOf(name) > -1);
    const lineLimit = 500;

    let covers = null;
    let contents = null;
    let timeout = void 0;

    const addEnterKeyListener = (element) => {
        element.addEventListener("keydown", (evt) => {
            if (evt.key === "Enter") {
                evt.preventDefault();
                search(evt);
            }
        });
    };
    
    addEnterKeyListener(keywordInput1);
    addEnterKeyListener(keywordInput2);
    addEnterKeyListener(keywordInput3);

    const createLine = (cover, line) => {
        const tr = document.createElement("tr");
        table.appendChild(tr);

        const cellContents = [
            cover[3], cover[4], line[0], line[1],
            line[3], line[4], line[5], line[7]
        ];

        cellContents.forEach(content => {
            const td = document.createElement("td");
            td.textContent = content;
            tr.appendChild(td);
        });
    };

    const updateTable = (options, index = 0, displayedIndex = 0) => {
        if (isIOS && displayedIndex >= lineLimit) return;

        for (; index < contents.length; index++) {
            const line = contents[index];

            // Show number of results
            resultElement.textContent = displayedIndex;

            const items = [line[3], line[4], line[7]]
            const inputString = items.join("\t")
            const matchesKeyword = searchKeywords(inputString, options.keyword);

            if (options.keyword && !matchesKeyword) continue;
            if (keywordInput2.value && Number(line[0]) < keywordInput2.value) continue;
            if (keywordInput3.value && Number(line[0]) > keywordInput3.value) continue;

            const cover = covers.find(n => n[2] == line[0]);
            if (!cover) continue;

            createLine(cover, line);
            timeout = setTimeout(() => updateTable(options, ++index, ++displayedIndex), 0);
            break;
        }
    };

    const makeCSV = (table_, filename) => {
        const csv = Array.from(table_.rows)
            .map(row => Array.from(row.cells)
                .map(cell => `"${cell.textContent.replace(/"/g, '""')}"`)
                .join(',')
            )
            .join('\n');

        const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv' });

        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveBlob(blob, filename);
        } else {
            downloadLink.download = filename;
            downloadLink.href = window.URL.createObjectURL(blob);
        }
    };

    const downloadCSV = () => {
        makeCSV(document.querySelector("main table"), `ips_${getDateString()}.csv`);
    };

    const getDateString = () => {
        const date = new Date();
        return [
            date.getFullYear(),
            ("00" + (date.getMonth() + 1)).slice(-2),
            ("00" + date.getDate()).slice(-2),
            ("00" + date.getHours()).slice(-2),
            ("00" + date.getMinutes()).slice(-2),
            ("00" + date.getSeconds()).slice(-2)
        ].join('');
    };

    const search = (e) => {
        if (e) e.stopPropagation();
        table.innerHTML = '';

        if (!isValidString(keywordInput1.value) && !keywordInput2.value && !keywordInput3.value) {
            // Initialize result
            resultElement.textContent = 0;
            return;
        }

        clearTimeout(timeout);
        updateTable({ keyword: keywordInput1.value });
    };

    document.getElementById("submit").onclick = search;
    downloadLink.onclick = downloadCSV;

    fetch("Covers.json")
        .then(response => response.json())
        .then(json => { covers = json; });

    fetch("Contents.json")
        .then(response => response.json())
        .then(json => { contents = json; });
};

function searchKeywords(inputString, keywords) {
    // Split keywords with spaces
    const keywordArray = keywords.split(/\s+|　+|\t/);

    // Check if each keyword is included in the string
    for (let keyword of keywordArray) {
        const regex = new RegExp(keyword, 'iu'); // Case insensitive, Unicode compatible
        if (!regex.test(inputString)) {
            return false; // Returns false if any keyword is not included
        }
    }
    return true; // Returns true if all keywords are included
}

function isValidString(str) {
    // Matches if the string contains only half-width spaces, full-width spaces, or tabs
    const regex = /^[\s　\t]*$/;
    // Check if it matches a regular expression and return the result
    return !regex.test(str);
}