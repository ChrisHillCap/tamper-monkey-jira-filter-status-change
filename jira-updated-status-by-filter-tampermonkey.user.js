// ==UserScript==
// @name         JIRA filter,all stories in progress
// @namespace    http://tampermonkey.net/
// @version      1
// @description  basic script to add form elements to jira which takes filter id and amount of records and returns in progress date
// @author       You
// @include      /https://jira\./
// @grant        none
// ==/UserScript==

(function() {

    const listOfStatusesWeCareAbout = ["Dev Ready", "started", "In Development","Ready for Review","Done"]
    'use strict';
    const windowLocationJira = window.location.origin

    function addBr(element) {
        return element.innerHTML += "<br>"
    }

    function addElementToMainPage(element) {
        const pageElem = document.getElementById("page")
        if(pageElem == null) {
            document.getElementsByTagName("body")[0].appendChild(element)
            return "body";
        } else {
            pageElem.appendChild(element);
            return "page";
        }
    }

    function addSubmitForm() {

        var divElement = document.createElement("div")

        var labelForFilterId = document.createElement("label");
        labelForFilterId.innerHTML = "Please enter a valid filter id for issues you wish to see the 'when set to in progress' timestamp'"
        labelForFilterId.setAttribute("for","filter-id-tamper-monkey");

        var labelForAmountOfIssuesToSearch = document.createElement("label");
        labelForAmountOfIssuesToSearch.innerHTML = "Please enter the number of issues in the filter you wish to search in, Please be aware of how big your filter is. EVERY ISSUE makes a request to the Jira API. 4000 items in a filter is 4000 requests. "
        labelForAmountOfIssuesToSearch.setAttribute("for","amount-of-records-tamper-monkey");

        var buttonForSubmitFilter = document.createElement("button");
        buttonForSubmitFilter.innerHTML = "Return stats";
        buttonForSubmitFilter.id = "return-stats-tamper-monkey";

        var textBoxForFilterId = document.createElement("input");
        textBoxForFilterId.type = "text";
        textBoxForFilterId.id = "filter-id-tamper-monkey";

        var textBoxAmountOfRecordsToSearchForInFilter = document.createElement("input");
        textBoxAmountOfRecordsToSearchForInFilter.type = "text";
        textBoxAmountOfRecordsToSearchForInFilter.id = "amount-of-records-tamper-monkey";
        textBoxAmountOfRecordsToSearchForInFilter.defaultValue = "150";

        buttonForSubmitFilter.addEventListener ("click", validateBeforeCallingApis , false);
        addBr(divElement)
        divElement.appendChild(labelForFilterId);
        addBr(divElement)
        divElement.appendChild(textBoxForFilterId);
        addBr(divElement)
        divElement.appendChild(labelForAmountOfIssuesToSearch);
        addBr(divElement)
        divElement.appendChild(textBoxAmountOfRecordsToSearchForInFilter);
        addBr(divElement)
        divElement.appendChild(buttonForSubmitFilter);

        addElementToMainPage(divElement);

    }
    addSubmitForm();

    //not my func: https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_sort_table_desc
    function sortTable() {
        var table, rows, switching, i, x, y, shouldSwitch;
        table = document.getElementById("issuesWithInProgress");
        switching = true;
        /*Make a loop that will continue until
  no switching has been done:*/
        while (switching) {
            //start by saying: no switching is done:
            switching = false;
            rows = table.rows;
            /*Loop through all table rows (except the
    first, which contains table headers):*/
            for (i = 1; i < (rows.length - 1); i++) {
                //start by saying there should be no switching:
                shouldSwitch = false;
                /*Get the two elements you want to compare,
      one from current row and one from the next:*/
                x = rows[i].getElementsByTagName("TD")[0];
                y = rows[i + 1].getElementsByTagName("TD")[0];
                //check if the two rows should switch place:
                if (Date.parse(x.innerHTML) > Date.parse(y.innerHTML)) {
                    //if so, mark as a switch and break the loop:
                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {
                /*If a switch has been marked, make the switch
      and mark that a switch has been done:*/
                rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                switching = true;
            }
        }
    }
    async function getAllIssuesReturn(filterId, amountOfRecords) {

        return fetch(windowLocationJira + "/rest/api/2/search?jql=filter=" + filterId +"&maxResults=" + amountOfRecords).then(response => response.text()).then(text => {

            const jsonDocument = JSON.parse(text);
            const issues = jsonDocument.issues;

            var keys = [];
            var i;
            for (i = 0; i < issues.length; ++i) {
                keys.push(issues[i].key);
            }
            return keys;
        });

    }


    function callApisWithFilterAndGetResults(filterId, amountOfRecords) {

        var leTable = document.createElement("table");
        var buttonForSort = document.createElement("button");
        buttonForSort.addEventListener ("click", sortTable , false);
        buttonForSort.innerHTML = "Sort Table By Date";
        //set table attributes
        leTable.setAttribute("border","1");
        leTable.setAttribute("id","issuesWithInProgress");
        var header = leTable.createTHead();
        var rowForHeader = header.insertRow(0);
        var updatedTitle = rowForHeader.insertCell(0);
        var mainTitle = rowForHeader.insertCell(1);
        var statusChangeTo = rowForHeader.insertCell(2);
        var issueIdHeader = rowForHeader.insertCell(3);
        updatedTitle.innerHTML = "<b>Updated timestamp of change in ticket</b>";
        mainTitle.innerHTML = "<b>Title of ticket</b>";
        statusChangeTo.innerHTML = "<b>Changed to Status</b>";
        issueIdHeader.innerHTML = "<b> Issue Id </b>";

        var tableRowCount = 1;
        function extractTheCategory(entry) {
            return entry.getElementsByTagName("category")[0]
        }
        function getTermAttribute(entry) {
            return entry.getAttribute("term");
        }
        function extractTheUpdatedTimestamp(entry) {
            return entry.getElementsByTagName("updated")[0].childNodes[0].nodeValue;
        }
        function extractTheTitle(entry) {
            return entry.getElementsByTagName("title")[0].childNodes[0].nodeValue;
        }
        function tableReturnWithNewRows(arrayOfstatusUpdatedTimestampTitleOfEntryIssueId, table) {
            arrayOfstatusUpdatedTimestampTitleOfEntryIssueId.forEach(arrayElement => {
                var row = table.insertRow(table.length + 1);
                var timestampCell = row.insertCell(0);
                var titleCell = row.insertCell(1);
                var statusChangedToCell = row.insertCell(2);
                var issueIDCell = row.insertCell(3);
                statusChangedToCell.innerHTML = arrayOfstatusUpdatedTimestampTitleOfEntryIssueId[0];
                timestampCell.innerHTML = arrayOfstatusUpdatedTimestampTitleOfEntryIssueId[1];
                titleCell.innerHTML = arrayOfstatusUpdatedTimestampTitleOfEntryIssueId[2];
                issueIDCell.innerHTML = arrayOfstatusUpdatedTimestampTitleOfEntryIssueId[3];
            })
            return table;
        }

        async function fetchFromActivityApi(issueKey) {
            return fetch(windowLocationJira + "/activity?maxResults=1000&streams=issue-key+IS+" + issueKey + "&os_authType=basic&title=undefined&orderBy=Status")
        }
        function takesIssueAndResponseAndReturnsArrayOfRows(issue, textOfResponse) {

            var parser = new DOMParser();
            console.log(textOfResponse, textOfResponse.text(), "xccvxcvxvcxv");
            var xmlDocument = parser.parseFromString(textOfResponse.text(), "text/xml");

            var activityEntries = xmlDocument.getElementsByTagName("entry");

            var arrayOfRows = [];
            //console.log(activityEntries);
            for (var i = 0; i < activityEntries.length; i++) {
                const category = extractTheCategory(activityEntries[i]);
                const titleOfEntry = extractTheTitle(activityEntries[i]);
                const updatedTimestampOfEntry = extractTheUpdatedTimestamp(activityEntries[i]);
                console.log(category);
                if(category != null) {
                    const termOfCategory = getTermAttribute(category)
                    if(!listOfStatusesWeCareAbout.includes(termOfCategory)) {

                        console.log([termOfCategory, updatedTimestampOfEntry, titleOfEntry, issue]);
                        arrayOfRows.push([termOfCategory, updatedTimestampOfEntry, titleOfEntry, issue]);
                        console.log(arrayOfRows);
                    }
                }
            }
            return arrayOfRows;
        }


        const arrayOfPromisesWhichContainArrayOfRows = getAllIssuesReturn(filterId, amountOfRecords).then(issueKeys =>

                                                                                                          issueKeys.map(issueKey =>
                                                                                                             fetchFromActivityApi(issueKey).then(response => {
            console.log(typeof(response), response);
                                                                                                                                                 return takesIssueAndResponseAndReturnsArrayOfRows(issueKey, response)})
                                                                                                                                    ));

        arrayOfPromisesWhichContainArrayOfRows.then(arrayOfPromises => {
            console.log(arrayOfPromises);
                                                                 Promise.all(arrayOfPromises).then(arrayOfRows =>
                                                                                      arrayOfRows.map(array =>
                                                                                 tableReturnWithNewRows(array, leTable)))}).then(a => {
            document.getElementsByTagName("body")[0].appendChild(buttonForSort);
            document.getElementsByTagName("body")[0].appendChild(leTable);
        })


    }


    function validateBeforeCallingApis() {
        function validateString(stringToValidate) {
            if(stringToValidate.includes(" ") || stringToValidate == "") {
                return false
            } else {return true}
        }

        const filterTextBox = document.getElementById("filter-id-tamper-monkey");
        const amountOfRecordsTextBox = document.getElementById("amount-of-records-tamper-monkey");
        const amountOfRecordsTextBoxTrimmed = amountOfRecordsTextBox.value.trim();
        const filterTextBoxTrimmed = filterTextBox.value.trim();

        if(!validateString(amountOfRecordsTextBoxTrimmed) || !validateString(filterTextBoxTrimmed)) {
            alert("**Please ensure that: Filter field has no spaces in the ID** Please ensure that: Amount of records has a number in and has no spaces in it");
        } else {
            callApisWithFilterAndGetResults(filterTextBoxTrimmed, amountOfRecordsTextBoxTrimmed)
        }
    }

})();
