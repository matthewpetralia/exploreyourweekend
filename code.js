/*eslint-env es6*/
/*global require*/

document.getElementsByTagName("head")[0].innerHTML += `
    <html lang = "en">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <link rel="icon" type="image/x-icon" href="/SVG/Explore%20your%20Weekend%20Logo.svg">
    <link href="https://fonts.googleapis.com/css2?family=Material+Icons+Outlined" rel="stylesheet">
`;
    
//var getDevUrl = window.location;
//if (getDevUrl = "https://dev.exploreyourweekend.com/") {
//    alert("You are viewing the DEV version of this page. Please navigate to https://exploreyourweekend.com/ for the published version.")
//}
//            <span class="material-icons-outlined" id="expand">expand_less</span>

function formContent() {

    let main = document.querySelector(".Main");

    let createNav = `
        <div class="Nav">
        <a title="Menu" href="javascript:void(0);" onclick="myFunction()">
            <span class="material-icons-outlined" id="expand">expand_less</span>
            <h1>Explore your Weekend</h1>
        </a>
        <div id="myLinks">
            <div class="InfoPanel">
                <div class="tags">
                </div>
            </div>
        </div>
    </div>`
    main.insertAdjacentHTML('afterend', createNav)

    let text = " ";

    for (e = 0; e < main.children.length; e++) {


        let h2 = document.getElementsByTagName("h2");
        let h3 = document.getElementsByTagName("h3");
        
        let addImage ='<picture><source srcset="m-' + (h2[e].innerHTML.replace(/\s+/g, '_'))+'('+(h3[e].innerHTML.replace(/\s+/g, '_'))+')' + '.webp" media="(orientation: portrait)"><img src="' +  (h2[e].innerHTML.replace(/\s+/g, '_'))+'('+(h3[e].innerHTML.replace(/\s+/g, '_'))+')' + '.webp" onerror="this.onerror=null;this.src=' + "'" + '../Images/Springbrook_National_Park.webp' + "'" + ';" alt="' + h2[e].innerHTML + ', ' + h3[e].innerHTML + ' - Explore your Weekend"></picture>';

        document.getElementsByClassName("InfoPanel")[e].insertAdjacentHTML('beforebegin', addImage);

        text += document.querySelector("#myLinks .tags").innerHTML = "<a href='#" + main.children[e].id + "' onclick='myFunction()'>" + h2[e].innerHTML + "</a>";


    }

    document.querySelector(".Nav .tags").innerHTML = '<h1><a href="../"><img src="/SVG/Explore%20your%20Weekend%20Logo.svg" alt="Explore your Weekend"></a></h1>' + text;

    document.getElementsByTagName("head")[0].innerHTML +=
        '<link href="https://use.typekit.net/ade3twf.css" rel="stylesheet">'

    let nextLast = document.querySelector(".Main").lastElementChild;
    nextLast.querySelector(".fwd").href = "#" + (document.querySelectorAll(".Main > div")[0]).id;

    document.querySelectorAll(".Main > div .bwd")[0].href = "/";


    for (let j = 0; j < (document.querySelectorAll(".Main > div")).length; j++) {
        var allTheData =
            document.getElementsByClassName('tagContent')[j].textContent.split(',');
        var separateList = '<div class="tags">';
        allTheData.forEach(function (value) {
            separateList += '<div>' + value + '</div>';
        });
        separateList += '</div>';
        document.getElementsByClassName("tagContent")[j].innerHTML = separateList;

        (document.getElementsByClassName('fwd')[j]).href = "#" + (document.querySelectorAll(".Main > div")[j + 1]).id;

        (document.getElementsByClassName('bwd')[j + 1]).href = "#" + (document.querySelectorAll(".Main > div")[j]).id;
    }


}

function writeIndex() {


    let main = document.querySelector(".Landing");

    let createNav = `
        <div class="Nav">
        <a title="Menu" href="javascript:void(0);" onclick="myFunction()">
            <span class="material-icons-outlined" id="expand">expand_less</span>
            <h1>Explore your Weekend</h1>
        </a>
        <div id="myLinks">
            <div class="InfoPanel">
                <div class="tags">
                </div>
            </div>
        </div>
    </div>`
    main.insertAdjacentHTML('afterend', createNav)

    let text = " ";

    for (e = 0; e < main.children.length; e++) {


        let h2 = document.getElementsByTagName("h2");
        let h3 = document.getElementsByTagName("h3");
        
        let addImage ='<picture><source srcset="Images/m-' + (h2[e].innerHTML.replace(/\s+/g, '_'))+'_'+(h3[e].innerHTML.replace(/\s+/g, '_'))+ '.webp" media="(orientation: portrait)"><img src="Images/' +  (h2[e].innerHTML.replace(/\s+/g, '_'))+'_'+(h3[e].innerHTML.replace(/\s+/g, '_')) + '.webp" onerror="this.onerror=null;this.src=' + "'" + 'Images/m/m-Sp_.webp' + "'" + ';" alt="' + h2[e].innerHTML + ', ' + h3[e].innerHTML + ' - Explore your Weekend"></picture>';

        document.getElementsByClassName("InfoPanel")[e].insertAdjacentHTML('beforebegin', addImage);

        text += document.querySelector("#myLinks .tags").innerHTML = "<a href='#" + main.children[e].id + "' onclick='myFunction()'>" + h2[e].innerHTML +" "+h3[e].innerHTML + "</a>";


    }

    document.querySelector(".Nav .tags").innerHTML = '<h1><a href="../"><img src="/SVG/Explore%20your%20Weekend%20Logo.svg" alt="Explore your Weekend"></a></h1>' + text;

    document.getElementsByTagName("head")[0].innerHTML +=
        '<link href="https://use.typekit.net/ade3twf.css" rel="stylesheet">'

    var getUrl = window.location;
    if (getUrl = "https://exploreyourweekend.com/") {
        document.getElementsByTagName("body").className += " Dev";
    }


    for (let j = 0; j < (document.querySelectorAll(".Landing > div")).length; j++) {
        var allTheData =
            document.getElementsByClassName('tagContent')[j].textContent.split(',');
        var separateList = '<div class="tags">';
        allTheData.forEach(function (value) {
            separateList += '<div>' + value + '</div>';
        });
        separateList += '</div>';
        document.getElementsByClassName("tagContent")[j].innerHTML = separateList;
    }



}

function myFunction() {
    var x = document.getElementById("myLinks");
    if (x.style.display === "block") {
        x.style.display = "none";
        document.querySelector(".Nav > a").style.borderRadius = "3vh 3vh 0 0";
        document.getElementById("expand").innerHTML = "expand_less";
    } else {
        x.style.display = "block";
        document.querySelector(".Nav > a").style.borderRadius = "0px";
        document.getElementById("expand").innerHTML = "expand_more";
    }
}
