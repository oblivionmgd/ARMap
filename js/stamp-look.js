Vue.config.ignoredElements = [
    "a-scene",
    "a-entity",
    "a-camera",
    "a-box",
    "a-marker"
]
//Vueの外部で作成されたカスタムタグ等で無視するものを指定

//オブジェクトを定義（Vueインスタンスを作成）
const app = new Vue({
    el: "#main-container", //elオプションにはclassかidを指定
    data: { //dataオプション
        cameraSelected: true,
        stampSelected: false,
        mapSelected: false,
        infoSelected: false,
        video: {}
    },
    methods: {
        tabSelected(tab) { //引数のtab
          //初期化
            this.cameraSelected = false
            this.stampSelected = false
            this.mapSelected = false
            this.infoSelected = false

//選択されたtabをtrueにする
            switch (tab) {
                case "camera":
                    this.cameraSelected = true
                    break
                case "stamp":
                    this.stampSelected = true
                    break
                case "map":
                    this.mapSelected = true
                    break
                default:
                    this.infoSelected = true
                    break
            }
        }
    },
    mounted() { //DOM要素にアクセスできるようになる
    }
})

//windowがスクロールされたとき
window.addEventListener("scroll", () => {
    document.body.scrollLeft = 0 //<body>要素にスクロールの水平位置に0を代入
}, false) //falseの意味

let displayTimeCount = 0
let markerIsShown = false
let displayedMarkerId = 0

//スタンプ確認ページの処理ここから

const fullPoints = 5 //マーカーの総数

for (let index = 1; index <= 5; index++) {
    if (localStorage.getItem("s" + String(index)) == "1") {//s数字　スタンプが"1"のとき
        document.getElementById("stamp-img-" + String(index)).src = "../images/stamps/2019/s" + String(index) + ".png"
    }
//stamp-img-数字 のスタンプの画像をs indexのsrcに変更する
}

//ローカルストレージに保存されている"visitedPoints"を数値に変換して代入
let currentPoints = Number(localStorage.getItem("visitedPoints"))
if (currentPoints == null) {
    currentPoints = 0 //ローカルストレージに保存されている訪れた場所のステータスが0のとき現在のポイントを0にする
}

const restPoints = fullPoints - currentPoints //残りの未習得スタンプ数を取得
if (restPoints == 0) { //残りスタンプ数が0ならコンプリート表示
    document.getElementById("stamp-num-text").innerText = "コンプリートしました!"
    document.getElementById("stamp-complete").style.display = "block" //表示形式をblockにする
} else { //まだ残っていれば残りの数を表示
    const displayText = "残り" + String(restPoints) + "ヶ所です"
    document.getElementById("stamp-num-text").innerText = displayText
    //idが"stamp-num-text"の場所のテキストを"残り何箇所"に書き換え
}

//スタンプ確認ページの処理ここまで

//一定時間(100ミリ秒)ごとに特定の処理を繰り返す
//以下の処理が全て第一引数
setInterval(() => {
    let elements = document.getElementsByTagName("a-marker") //a-markerタグの中身を代入（配列になる）
    markerIsShown = false
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        if (element.object3D.visible) { //3dオブジェクトが表示されているとき
            displayTimeCount++
            displayedMarkerId = Number(element.getAttribute("markerid")) //a-markerタグの中身の"markerid"を数値で返す
            markerIsShown = true
        }
    }

    if (!markerIsShown) { //マーカーが認識されなくなったらカウントを0
        displayTimeCount = 0
    }

    if (displayedMarkerId == "0"){ //初期値のままだったらreturn
        return
    }

    //??
    if (displayTimeCount == 8 && markerIsShown) {
        const alreadyDetected = localStorage.getItem("s" + String(displayedMarkerId), "1")
        if (alreadyDetected) { return }

        //visitedPointsを現在のポイントとして代入
        let currentPoints = Number(localStorage.getItem("visitedPoints"))
        if (currentPoints == null) {
            currentPoints = 0 //訪れた場所がなければ0に初期化
        }
        currentPoints++ //currentPointsを1増やす
        localStorage.setItem("visitedPoints", String(currentPoints)) //visitedPoints(取得スタンプの数)を数字で保存
        const restPoints = fullPoints - currentPoints //残りのスタンプ数を計算

        let displayText = ""
        if (restPoints == 0) { //スタンプの残り数が0
            document.getElementById("stamp-num-text").innerText = "コンプリートしました!"
            document.getElementById("stamp-complete").style.display = "block"
        } else { //まだ残っていれば残り箇所を表示
            const displayText = "残り" + String(restPoints) + "ヶ所です"
            document.getElementById("stamp-num-text").innerText = displayText
        }
        //スタンプしたときのアラートを表示
        swal({
            title: "スタンプしました!",
            text: displayText,
            content: {
                element: "img",
                attributes: {
                    src: "../images/stamps/2019/s" + String(displayedMarkerId) + ".png",
                    style: "width:90%"
                }
            }
        }).then(() => {
            //スタンプアラート表示後に、もし残りスタンプが0なら実行
            if (restPoints == 0) {
                localStorage.setItem("ticket", "ON"); //コンプリート時にticketのフラグを立てる
                //コンプリートしたときのアラート表示
                swal({
                    title: "コンプリートしました!",
                    text: displayText,
                    content: {
                        element: "img",
                        attributes: {
                            src: "../images/stamps/complete.png",
                            style: "width:90%"
                        }
                    }
                })
            }
        })


        localStorage.setItem("s" + String(displayedMarkerId), "1")
        document.getElementById("stamp-img-" + String(displayedMarkerId)).src = "../images/stamps/2019/s" + String(displayedMarkerId) + ".png"
        ga('set', 'dimension1', String(currentPoints)); //?
    }
}, 100)

for (let index = 1; index <= fullPoints; index++) {
    let image = new Image() //新たなイメージ要素を作成
    image.src = "../images/stamps/2019/s" + String(index) + ".png"
}
let image = new Image()
image.src = "../images/stamps/complete.png"

const parser = new UAParser() //モバイルの判別
const result = parser.getResult()
if (result.browser.name != "Mobile Safari" && result.os.name == "iOS"){
    swal ( "" ,  "Safariで開いてください" ,  "error" )
}else if (result.os.name == "iOS" && result.os.version.startsWith("10")){
    swal ( "" ,  "iOS10では正常に動作しない場合があります" ,  "error" )
}else if (!result.browser.name.startsWith("Chrome") && result.os.name == "Android" ){
    swal ( "" ,  "Google Chromeで開いてください" ,  "error" )
}else if (result.os.name != "iOS" && result.os.name != "Android" ){
    swal ( "" ,  "PCでは正常に動作しない場合があります" ,  "error" )
}else {
    if (localStorage.getItem("isFirstVisit") == null){
        //ブラウザを開いた初回のみ説明アラート表示
        swal("使い方", "校内に掲示されたマーカーをカメラで写すとスタンプを集めることができます。")
        localStorage.setItem("isFirstVisit","false") //falseに初期化
    }
}
