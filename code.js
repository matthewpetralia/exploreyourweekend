/*eslint-env es6*/
/*global require*/

document.getElementsByTagName("head")[0].innerHTML += `
    <link rel="icon" type="image/x-icon" href="SVG/Explore%20your%20Weekend%20Logo.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@700&family=Hubballi&family=Lato:wght@300;400;700&display=swap" rel="stylesheet">`;


function writeHTML() {
    let main = document.querySelector(".Main");

    let writeContent;

    let createNav = `
        <div class="Nav">
        <a href="javascript:void(0);" onclick="myFunction()">
            <span class="material-icons-outlined" id="expand">expand_less</span>
        </a>
        <div id="myLinks">
            <div class="InfoPanel">
                <h4></h4>
                <h3>Explore</h3>
                <div class="tags">
                </div>
            </div>
        </div>
    </div>`
    main.insertAdjacentHTML('afterend', createNav)

    let text = " ";

    for (e = 0; e < main.children.length; e++) {


        const A1 = main.children[e].innerHTML.split(";");
        let ref = "A";



        main.children[e].innerHTML =
            '<img src = "Images//' + A1[0] + '.webp" onerror="this.onerror=null;this.src=' + "'" + 'Images/IMG_1540.jpg' + "'" + ';"><a class="bwd"></a><a class="fwd"></a><div class="InfoPanel"><h4>' + A1[4] + '</h4><h3>' + A1[1] + '</h3><div class="tagContent">' + A1[2] + '</div><p>' + A1[3] + '</p></div>';


        text += document.querySelector("#myLinks .tags").innerHTML = "<a href='#" + (A1[1].replace(/\s+/g, '')) + "' onclick='myFunction()'>" + A1[1] + "</a>";


    }

    document.querySelector(".Nav .tags").innerHTML = '<a href="index.html"><span class="material-icons-outlined">home</span></a>' + text;

    document.getElementsByTagName("title")[0].innerHTML += " | Explore your Weekend";


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

function arrows() {
    let nextLast = document.querySelector(".Main").lastElementChild;
    nextLast.querySelector(".fwd").href = "#" + (document.querySelectorAll(".Main > div")[0]).id;


    document.querySelectorAll(".Main > div .bwd")[0].href = "#" + document.querySelectorAll(".Main > div")[(document.querySelectorAll(".Main > div").length) - 1].id;
}
