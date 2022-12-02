const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
let productsData = [];

const shoppingCartList = document.querySelector('.shoppingCartList');
let cartListData = [] ;

//初始化
function init(){
    getProductList();
    getCartList();
}
init();

/************首頁產品列表*************/
// 1. 取得API產品列表，並呼叫 render 函式
function getProductList(){
    axios.get(productListUrl)
    .then( res=>{
        productsData = res.data.products;
        //console.log(productsData);
        renderProductList();   
    }).catch(error=>{
        console.log(error.response.data);
    })
}

// 2. 組合產品項目
function combineProductItem(item){
    return `
    <li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="">
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$ ${item.origin_price}</del>
        <p class="nowPrice">NT$ ${item.price}</p>
    </li>
    `;
}

// 3. 將產品列表渲染到畫面上
function renderProductList(){
    let productlist = "";
    productsData.forEach(item=>{
        productlist += combineProductItem(item);
    })
    productWrap.innerHTML = productlist;
}

//4. 篩選:顯示符合條件產品
productSelect.addEventListener('change',e=>{
    //console.log(e.target.value);
    const category = e.target.value;
    if(category == "全部"){
        renderProductList();
        return;
    }

    let productlist = "";
    productsData.forEach(item=>{
        if( category == item.category){
            productlist += combineProductItem(item);
        }
    })
    productWrap.innerHTML = productlist;
})



/************首頁 購物車*************/

// 1. get 取得購物車列表
function getCartList(){
    axios.get(shoppingCartUrl)
    .then( res=>{
        cartListData = res.data.carts;
        const finalTotal = document.querySelector('.finalTotal');
        let finalTotalPrice= res.data.finalTotal;
        finalTotal.textContent = finalTotalPrice;
        renderCartList();   
    }).catch(error=>{
        console.log(error.response.data);
    })
}

// 2. 組合購物車內容
function combineCartItem(item){
    return `<tr>
    <td>
        <div class="cardItem-title">
            <img src="${item.product.images}" alt="">
            <p>${item.product.title}</p>
        </div>
    </td>
    <td>NT$ ${item.product.price}</td>
    <td> ${item.quantity}</td>
    <td>NT$ ${ item.product.price * item.quantity}</td>
    <td class="discardBtn" >
        <a href="#" class="material-icons" data-id="${item.id}">
            clear
        </a>
    </td>
    </tr>`
}

// 3. 渲染到購物車畫面中
function renderCartList(){
    let str = "";
    cartListData.forEach(item=>{
        str += combineCartItem(item);  
    })
    shoppingCartList.innerHTML = str;
}

// 4. 加入購物車(新增)
productWrap.addEventListener("click",e=>{
    e.preventDefault(); 
    let addCardBtnCalss = e.target.getAttribute("class"); //取得點擊的class 屬性值
    if(addCardBtnCalss !== "addCardBtn"){
        return;
    }
    let productId = e.target.getAttribute("data-id"); //取得點擊的產品編號

    
    //購買數量
    let itemNum = 1;
    cartListData.forEach(item=>{
        if(productId == item.product.id){
            itemNum = item.quantity +=1;
        }
    })
    axios.post(shoppingCartUrl,{
        "data": {
            "productId": productId,
            "quantity": itemNum
          }
    }).then(res=>{
        alert('已加入購物車');
        getCartList();
    })
    console.log(itemNum);
})


//刪除單一產品
shoppingCartList.addEventListener('click', e=>{
    e.preventDefault();
    console.log(e.target);
    const cartId = e.target.getAttribute("data-id"); //取得刪除品項id
    if(cartId == null){
        return;
    }
    axios.delete(shoppingCartUrl+`/${cartId}`).then(res=>{
        alert('刪除成功');
        getCartList();
    })
    
})


//清空購物車
const discardAllBtn = document.querySelector('.discardAllBtn');
discardAllBtn.addEventListener('click',e=>{
    e.preventDefault();
    axios.delete(shoppingCartUrl).then(res=>{
        alert('刪除全部成功');
        getCartList();
    })
    .catch(res=>{
        alert('購物車已清空');
    })
})

/************訂單*************/
//送出訂單
const orderInfoBtn = document.querySelector('.orderInfo-btn');
orderInfoBtn.addEventListener("click", e=>{
    e.preventDefault();
    
    //確認購物車有無資料
    if(cartListData.length == 0){
        alert('請將產品加入購物車')
        return;
    }
    // else{
    //     alert('購物車有產品')
    // }
    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAddress = document.querySelector('#customerAddress').value;
    const tradeWay = document.querySelector('#tradeWay').value;

    //console.log(customerName,customerPhone,customerEmail,customerAddress,tradeWay);

    if(customerName==""||customerPhone==""||customerEmail==""||customerAddress==""||tradeWay==""){
        alert('請填寫訂購資訊')
        return;
    }

    axios.post(ordersUrl,{
        "data": {
            "user": {
              "name": customerName,
              "tel": customerPhone,
              "email": customerEmail,
              "address": customerAddress,
              "payment": tradeWay
            }
        }
    }).then(res=>{
        alert('成功送出訂單');
        document.querySelector('#customerName').value="";
        document.querySelector('#customerPhone').value="";
        document.querySelector('#customerEmail').value="";
        document.querySelector('#customerAddress').value="";
        document.querySelector('#tradeWay').value="ATM";
        getCartList();

    }).catch(error=>{
        console.log(error.response.data);
    })

})


