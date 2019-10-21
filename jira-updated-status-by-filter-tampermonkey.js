// ==UserScript==
// @name         JIRA filter,all stories in progress
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*jira.tools.tax.service.gov.uk/issues/*filter*
// @grant        none
// ==/UserScript==

(function() {
    const windowHref = window.location.href;
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

         return fetch("https://jira.tools.tax.service.gov.uk/rest/api/2/search?jql=filter=" + urlParamFilterNumber +"&maxResults=1000").then(response => response.text()).then(text => {
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

    fetch("https://jira.tools.tax.service.gov.uk/activity?maxResults=1000&streams=issue-key+IS+" + issueKeys[countFoo] + "&os_authType=basic&title=undefined&orderBy=Status").then(response => response.text()).then(text => {

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

})();
