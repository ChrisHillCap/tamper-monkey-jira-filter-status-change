// ==UserScript==
// @name         JIRA filter,all stories in progress
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  basic script to add form elements to jira which takes filter id and amount of records and returns in progress date
// @author       You
// @include      /https://jira\./
// @grant        none
// ==/UserScript==

(function() {
     function addSubmitForm() {
         var divElement = document.createElement("div")

         var labelForFilterId = document.createElement("label");
         labelForFilterId.innerHTML = "Please enter a valid filter id for issues you wish to see the 'when set to in progress' timestamp'"
         labelForFilterId.setAttribute("for","filter-id-tamper-monkey");

          var labelForAmountOfIssuesToSearch = document.createElement("label");
         labelForAmountOfIssuesToSearch.innerHTML = "Please enter the number of issues in the filter you wish to search in, Please be aware of how big your filter is. EVERY ISSUE makes a request to the Jira API. 4000 items in a filter is 4000 requests. "
         labelForAmountOfIssuesToSearch.setAttribute("for","amount-of-records-tamper-monkey");
        const buttonForSubmitFilter = document.createElement("button");
         buttonForSubmitFilter.innerHTML = "Return stats";
        buttonForSubmitFilter.id = "return-stats-tamper-monkey";
        const textBoxForFilterId = document.createElement("input");
        textBoxForFilterId.type = "text";
        textBoxForFilterId.id = "filter-id-tamper-monkey";
        const textBoxAmountOfRecordsToSearchForInFilter = document.createElement("input");
        textBoxAmountOfRecordsToSearchForInFilter.type = "text";
        textBoxAmountOfRecordsToSearchForInFilter.id = "amount-of-records-tamper-monkey";

       buttonForSubmitFilter.addEventListener ("click", validateBeforeCallingApis , false);
         divElement.innerHTML += "<br>"
         divElement.appendChild(labelForFilterId);
         divElement.innerHTML += "<br>"
         divElement.appendChild(textBoxForFilterId);
         divElement.innerHTML += "<br>"
         divElement.appendChild(labelForAmountOfIssuesToSearch);
         divElement.innerHTML += "<br>"
         divElement.appendChild(textBoxAmountOfRecordsToSearchForInFilter);
         divElement.innerHTML += "<br>"
         divElement.appendChild(buttonForSubmitFilter);
       document.getElementById("page").appendChild(divElement);

    }
    addSubmitForm();

    const windowLocationJira = window.location.origin

    const urlParamFilterNumber = new URLSearchParams(window.location.search).get('filter');

    //not my func https://www.w3schools.com/howto/tryit.asp?filename=tryhow_js_sort_table_desc
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
    'use strict';

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
    updatedTitle.innerHTML = "<b>Updated timestamp of change in ticket</b>";
    mainTitle.innerHTML = "<b>Title of ticket</b>";

    var tableRowCount = 1;

     async function getAllIssuesReturn() {

         return fetch(windowLocationJira + "/rest/api/2/search?jql=filter=" + filterId +"&maxResults=" + amountOfRecords).then(response => response.text()).then(text => {
        var i;
               var keys = [];
        const jsonDocument = JSON.parse(text);
        console.log(jsonDocument);
        const issues = jsonDocument.issues;
           for (i = 0; i < issues.length; ++i) {

               keys.push(issues[i].key);
           }
             return keys;
    });

     }
    getAllIssuesReturn().then(issueKeys => {


    var countFoo;
    for (countFoo = 0; countFoo < issueKeys.length; countFoo++) {

    fetch(windowLocationJira + "/activity?maxResults=1000&streams=issue-key+IS+" + issueKeys[countFoo] + "&os_authType=basic&title=undefined&orderBy=Status").then(response => response.text()).then(text => {

    var parser = new DOMParser();
    var xmlDocument = parser.parseFromString(text, "text/xml");

    var activityEntries = xmlDocument.getElementsByTagName("entry");

    var i;
    for (i = 0; i < activityEntries.length; i++) {
     
    if(activityEntries[i].getElementsByTagName("title")[0].childNodes[0].nodeValue.includes("started progress on")) {

      var row = leTable.insertRow(tableRowCount);

      var updatedTimestamp = row.insertCell(0);
      var title = row.insertCell(1);

      updatedTimestamp.innerHTML = activityEntries[i].getElementsByTagName("updated")[0].childNodes[0].nodeValue
      title.innerHTML = activityEntries[i].getElementsByTagName("title")[0].childNodes[0].nodeValue
      tableRowCount++
  }
}
     document.getElementsByTagName("body")[0].appendChild(buttonForSort);
     document.getElementsByTagName("body")[0].appendChild(leTable);

   })
        }
    });
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
