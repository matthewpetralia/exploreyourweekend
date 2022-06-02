/*eslint-env es6*/
/*global require*/

document.getElementsByTagName("head")[0].innerHTML += `
    <link rel="icon" type="image/x-icon" href="/SVG/Explore%20your%20Weekend%20Logo.svg">
    <link href="https://fonts.googleapis.com/css2?family=Material+Icons+Outlined" rel="stylesheet">
`;


function writeHTML() {

    let main = document.querySelector(".Main");

    let createNav = `
        <div class="Nav">
        <a href="javascript:void(0);" onclick="myFunction()">
            <span class="material-icons-outlined" id="expand">expand_less</span>
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


        const A1 = main.children[e].innerHTML.split(";");

        main.children[e].innerHTML =
            '<picture><source srcset="../Images/m/m-' + A1[0] + '.webp" media="(orientation: portrait)"><img src="../Images/' + A1[0] + '.webp" onerror="this.onerror=null;this.src=' + "'" + '../Images/m/m-Sp_.webp' + "'" + ';" alt="' + A1[1] + ', ' + A1[4] + ' - Explore your Weekend"></picture>' +
            '<a class="bwd"></a><a class="fwd"></a><div class="InfoPanel"><h3>' + A1[4] + '</h3><h2>' + A1[1] + '</h2><div class="tagContent">' + A1[2] + '</div><p>' + A1[3] + '</p></div>';


        text += document.querySelector("#myLinks .tags").innerHTML = "<a href='#" + (A1[1].replace(/\s+/g, '')) + "' onclick='myFunction()'>" + A1[1] + "</a>";


    }

    document.querySelector(".Nav .tags").innerHTML = '<h1><a href="../"><img src="/SVG/Explore%20your%20Weekend%20Logo.svg" alt="Explore your Weekend"></a></h1>' + text;

    document.getElementsByTagName("title")[0].innerHTML += " | Explore your Weekend";

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
        <a href="javascript:void(0);" onclick="myFunction()">
            <span class="material-icons-outlined" id="expand">expand_less</span>
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


        const A1 = main.children[e].innerHTML.split(";");

        main.children[e].innerHTML =
            '<picture><source srcset="Images/m/m-' + A1[0] + '.webp" media="(orientation: portrait)"><img src="Images/' + A1[0] + '.webp" onerror="this.onerror=null;this.src=' + "'" + 'Images/m/m-Sp_.webp' + "'" + ';" alt="' + A1[1] + ' ' + A1[2] + ' - Explore your Weekend"></picture>' +
            '<a class="fwd" href="' + (A1[1].replace(/\s+/g, '')) + (A1[2].replace(/\s+/g, '')) + '"></a><div class="InfoPanel"><h2>' + A1[1] + '</h2><h3>' + A1[2] + '</h3><div class="tagContent">' + A1[3] + '</div></div>';


        text += document.querySelector("#myLinks .tags").innerHTML = "<a href='#" + (A1[1].replace(/\s+/g, '')) + (A1[2].replace(/\s+/g, '')) + "' onclick='myFunction()'>" + A1[1] + " " + A1[2] + "</a>";


    }

    document.querySelector(".Nav .tags").innerHTML = '<h1><a href="../"><img src="/SVG/Explore%20your%20Weekend%20Logo.svg" alt="Explore your Weekend"></a></h1>' + text;

    document.getElementsByTagName("title")[0].innerHTML += " | Explore your Weekend";

    document.getElementsByTagName("head")[0].innerHTML +=
        '<link href="https://use.typekit.net/ade3twf.css" rel="stylesheet">'




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
