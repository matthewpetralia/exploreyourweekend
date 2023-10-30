/*eslint-env es6*/
/*global require*/

document.getElementsByTagName("head")[0].innerHTML += `
    <html lang = "en">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <link rel="icon" type="image/x-icon" href="/ExploreYourWeekendLogoGREEN.svg">
    <meta property="og:image" content="/Images/m-Ultimate_Guide_.webp" />
    <link href="https://fonts.googleapis.com/css2?family=Material+Icons+Outlined" rel="stylesheet">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
`;

//var getDevUrl = window.location;
//if (getDevUrl = "https://dev.exploreyourweekend.com/") {
//    alert("You are viewing the DEV version of this page. Please navigate to https://exploreyourweekend.com/ for the published version.")
//}
//            <span class="material-icons-outlined" id="expand">expand_less</span>
function arrows(){
for (v = 0; v < document.getElementsByClassName("fwd").length; v++) {
    document.querySelectorAll(".fwd")[v].innerHTML = '<span class="material-symbols-outlined">chevron_right</span>';
}
    
for (v = 0; v < document.getElementsByClassName("bwd").length; v++) {
    document.querySelectorAll(".bwd")[v].innerHTML = '<span class="material-symbols-outlined">chevron_left</span>';
}
    
for (v = 0; v < document.querySelectorAll(".tags a:not(a[target='_blank'])").length; v++) {
    document.querySelectorAll(".tags a:not(a[target='_blank'])")[v].innerHTML += '<span class="material-symbols-outlined">chevron_right</span>';
}
    
for (v = 0; v < document.querySelectorAll("a[target='_blank']").length; v++) {
    document.querySelectorAll("a[target='_blank']")[v].innerHTML += '<span class="material-symbols-outlined">arrow_outward</span>';
}
}

function createNav() {
    let navContent = `
        <div class="Nav">
        <a title="Menu" href="javascript:void(0);" onclick="myFunction()">
            <h1><img src="/ExploreYourWeekendLogo.svg" alt="Explore your Weekend"></h1>
            <span class="material-icons-outlined" id="expand">expand_less</span>
            
        </a>
        <div id="myLinks">
            <div class="InfoPanel">
                <div class="tags">
                    <h1><a href="../"><img src="/ExploreYourWeekendLogoGREEN.svg" alt="Explore your Weekend"></a></h1>
                    <div>
                        <a href="/About">About</a>
                        <a href="https://www.instagram.com/exploreyourweekend/?hl=en" target='_blank'>Instagram</a>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
    document.querySelector(".Main, .Landing").insertAdjacentHTML('afterend', navContent);
}


function formContent() {

    let main = document.querySelector(".Main");

    createNav();

    let text = " ";

    for (e = 0; e < main.children.length; e++) {


        let h2 = document.getElementsByTagName("h2");
        let h3 = document.getElementsByTagName("h3");

        let addImage = '<picture><source srcset="m-' + (h2[e].innerHTML.replace(/\s+/g, '_')) + '(' + (h3[e].innerHTML.replace(/\s+/g, '_')) + ')' + '.webp" media="(orientation: portrait)" onerror="this.onerror=null;this.src=' + "'" + '../Images/Springbrook_National_Park.webp' + "'" + ';"><img src="' + (h2[e].innerHTML.replace(/\s+/g, '_')) + '(' + (h3[e].innerHTML.replace(/\s+/g, '_')) + ')' + '.webp" onerror="this.onerror=null;this.src=' + "'" + '../Images/Springbrook_National_Park.webp' + "'" + ';" alt="' + h2[e].innerHTML + ', ' + h3[e].innerHTML + ' - Explore your Weekend"></picture>' +
            '<a class="bwd"></a><a class="fwd"></a>';

        document.getElementsByClassName("InfoPanel")[e].insertAdjacentHTML('beforebegin', addImage);
        
        let navLinks = "<a href='#" + main.children[e].id + "' onclick='myFunction()'>" + h2[e].innerHTML + " " + h3[e].innerHTML + "</a>";
        document.querySelector("#myLinks .tags").insertAdjacentHTML('beforeend', navLinks);

    }


    document.getElementsByTagName("head")[0].innerHTML +=
        '<link href="https://use.typekit.net/ade3twf.css" rel="stylesheet">';

    arrows();

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

    createNav();

    let text = " ";

    for (e = 0; e < main.children.length; e++) {


        let h2 = document.getElementsByTagName("h2");
        let h3 = document.getElementsByTagName("h3");

        let addImage = '<picture><source srcset="Images/m-' + (h2[e].innerHTML.replace(/\s+/g, '_')) + '_' + (h3[e].innerHTML.replace(/\s+/g, '_')) + '.webp" media="(orientation: portrait)"><img src="Images/' + (h2[e].innerHTML.replace(/\s+/g, '_')) + '_' + (h3[e].innerHTML.replace(/\s+/g, '_')) + '.webp" onerror="this.onerror=null;this.src=' + "'" + 'Images/m/m-Sp_.webp' + "'" + ';" alt="' + h2[e].innerHTML + ', ' + h3[e].innerHTML + ' - Explore your Weekend"></picture>';

        document.getElementsByClassName("InfoPanel")[e].insertAdjacentHTML('beforebegin', addImage);

        let navLinks = "<a href='#" + main.children[e].id + "' onclick='myFunction()'>" + h2[e].innerHTML + " " + h3[e].innerHTML + "</a>";
        document.querySelector("#myLinks .tags").insertAdjacentHTML('beforeend', navLinks);



    }


    document.getElementsByTagName("head")[0].innerHTML +=
        '<link href="https://use.typekit.net/ade3twf.css" rel="stylesheet">'
    
        arrows();


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
