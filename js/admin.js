
let orderData = [] ;
const orderList = document.querySelector('.orderList');

// 1. 初始化
function init(){
    getOrderList();
}
init();

//2. 取得訂單資料
function getOrderList(){
    axios.get(ordersAdminUrl,{
        headers:{
            'Authorization':token,
        }
    }).then(res=>{
        orderData = res.data.orders;
        //console.log(orderData);
        renderOrderList();
        renderC3();
    })
}


//3. 組table 資料
function combineOrderList(item,itemProductStr,orderStatus,orderTime){
    return `
        <tr>
            <td> ${item.createdAt}</td>
            <td>
            <p> ${item.user.name}</p>
            <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${itemProductStr}
            </td>
            <td>${orderTime}</td>
                <td class="orderStatus">
                <a href="#" class="js-orderStatus" data-status="${item.paid}" 
                data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
            <input type="button" class="delSingleOrder-Btn js-orderDelete" value="刪除" data-id="${item.id}">
            </td>
        </tr>
        `;
}

function renderOrderList(){
    let orderListStr=""; //訂單清單

    orderData.forEach(item =>{

        //組訂單品項清單
        let itemProductStr=""; //訂單內的品項
        item.products.forEach(itemProduct=>{
            itemProductStr +=`
                 <p>${itemProduct.title} x ${itemProduct.quantity}</p>
            `;
        })

        //訂單狀態處理
        let orderStatus ="";
        if(item.paid=="true"){
            orderStatus = "已處理";
        }else{
            orderStatus = "未處理";
        }

        //轉換日期格式
        let timeFormat = new Date( item.createdAt*1000);
        let orderTime =`
        ${timeFormat.getFullYear()}/${timeFormat.getMonth()+1}/${timeFormat.getDate()}` 


        //組訂單列表
        orderListStr += combineOrderList(item,itemProductStr,orderStatus,orderTime);
    })
    orderList.innerHTML = orderListStr;
}



orderList.addEventListener("click",e=>{
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    let status= e.target.getAttribute("data-status");
    let id= e.target.getAttribute("data-id");
    //console.log(status,id);
    if(targetClass=="js-orderStatus"){     
        changeOrderStatus(status,id);
        return;
    }
    if(targetClass =="delSingleOrder-Btn js-orderDelete"){
        deleteOrderItem(id);
        return;
    }

})


function changeOrderStatus(status,id){
    let newStatus;
    if(status == true){
        newStatus = false;
    }else{
        newStatus = true;
    }

    axios.put(ordersAdminUrl,
    {
        "data":{
            "id":id,
            "paid":newStatus
        }
    },
    {
        headers:{
            'Authorization':token,
        }
    }).then(res=>{
        alert("修改訂單狀態成功");
        getOrderList();
    })

}

function deleteOrderItem(id){
    console.log(id);
    axios.delete(ordersAdminUrl+`/${id}`,
        {
            headers:{
                'Authorization':token,
            }
        }).then(res=>{
            alert("刪除該筆訂單成功");
            getOrderList();
        })
}



// C3.js
function renderC3(){
    let category = [];
    orderData.forEach(item=>{
        item.products.forEach(productItem=>{
            if(category[productItem.category] == undefined){
                category[productItem.category] = productItem.price*productItem.quantity;
            }else{
                category[productItem.category] += productItem.price*productItem.quantity;
            }
        })
    })
    console.log(category);

    let categoryNameArr= Object.keys(category);
    console.log(categoryNameArr);
    let newData =[];
    categoryNameArr.forEach(item=>{
        let arr=[];
        arr.push(item);
        arr.push(category[item]);
        newData.push(arr);
    })

    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: newData,
            colors:{
                "Louvre 雙人床架":"#DACBFF",
                "Antony 雙人床架":"#9D7FEA",
                "Anty 雙人床架": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}



const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener("click",e=>{
    e.preventDefault();
    axios.delete(ordersAdminUrl,{
        headers:{
            'Authorization':token,
        }
    }).then(res=>{
        alert("成功刪除全部訂單");
        getOrderList();
    })
})


// 預設 JS，請同學不要修改此處
let menuOpenBtn = document.querySelector('.menuToggle');
let linkBtn = document.querySelectorAll('.topBar-menu a');
let menu = document.querySelector('.topBar-menu');
menuOpenBtn.addEventListener('click', menuToggle);

linkBtn.forEach((item) => {
    item.addEventListener('click', closeMenu);
})

function menuToggle() {
    if(menu.classList.contains('openMenu')) {
        menu.classList.remove('openMenu');
    }else {
        menu.classList.add('openMenu');
    }
}
function closeMenu() {
    menu.classList.remove('openMenu');
}