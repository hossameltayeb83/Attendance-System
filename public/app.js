function Available(){
    let h1= document.getElementById('h1')
    let avaiableList = document.getElementById('available')
    let unAvailableList = document.getElementById('unavailable')
    let allEmpList = document.getElementById('allEmp')
    let availableBtn = document.getElementById('showAvailable')
    let unavailabBtn = document.getElementById('showUnavailable')
    if(availableBtn.innerHTML==="Available"){
        avaiableList.style.display="block"
        allEmpList.style.display="none"
        unAvailableList.style.display="none"
        h1.innerHTML="Available Employees"
        availableBtn.innerHTML="All Employees"
        unavailabBtn.innerHTML="Unavailable"
    }else{
        avaiableList.style.display="none"
        allEmpList.style.display="block"
        unAvailableList.style.display="none"
        h1.innerHTML="All Employees"
        availableBtn.innerHTML="Available"
    }  
}
function unAvailable(){
    let h1= document.getElementById('h1')
    let avaiableList = document.getElementById('available')
    let unAvailableList = document.getElementById('unavailable')
    let allEmpList = document.getElementById('allEmp')
    let availableBtn = document.getElementById('showAvailable')
    let unavailabBtn = document.getElementById('showUnavailable')    
    if(unavailabBtn.innerHTML==="Unavailable"){
        avaiableList.style.display="none"
        allEmpList.style.display="none"
        unAvailableList.style.display="block"
        h1.innerHTML="Unavailable Employees"
        unavailabBtn.innerHTML="All Employees"
        availableBtn.innerHTML="Available"
    }else{
        avaiableList.style.display="none"
        allEmpList.style.display="block"
        unAvailableList.style.display="none"
        h1.innerHTML="All Employees"
        unavailabBtn.innerHTML="Unavailable"
    }
}    