(function(w){
    w.damu={};
    w.damu.css = function css(node,type,val){
        // 判断node是否为object，并判断是否为空
        if(typeof node == 'object'&&typeof node['transform']=='undefined'){
            // 如果为空，则为node添加一个transform对象
            node['transform'] = {}
        }

        // 如果传过来三个参数
        if(arguments.length>=3){
            // 设置写入操作
            var text = ""
            // 插入属性
            node["transform"][type] = val;

            // 循环遍历添加指定属性
            for(item in node["transform"]){
                // 判断对象的原型中是否存在item，如果存在才进行下一步，避免混淆
                if(node["transform"].hasOwnProperty(item)){
                    switch (item) {
                        case "translateX":
                        case "translateY":
                        case "translateZ":
                            text += item+"("+node["transform"][item]+"px)"
                            break;
                        case "scale":
                            text += item+"("+node["transform"][item]+")"
                            break;
                        case "rotate":
                        text += item+"("+node["transform"][item]+"+deg)"
                            break;
                    
                    }

                }
            };
            node.style.transform = node.style.webkitTransform = text;
        }else if(arguments.length==2){
            // 读取
            val = node["transform"][type]
            if(typeof val === "undefined"){
                switch (type) {
                    case "translateX":
                    case "translateY":
                    case "rotate":
                        val = 0;
                        break;
                    case "scale":
                        val =1
                        break;
                }
            }
            return val;
        }
    }
    w.damu.carousel = function (imgArr){
        // 保存导航点数量
        var pointslength = imgArr.length

    // 另外复制一份数组
    // 布局
    var carouselWarp = document.querySelector('.carousel-warp')

    
        // 如果需要无缝才使用无缝滑屏
        var needCarousel = carouselWarp.getAttribute('needCarousel')
        needCarousel = needCarousel==null?false:true
        if(needCarousel){
            imgArr = imgArr.concat(imgArr);
        }
    // 创建ul标签
    var ulNodes = document.createElement('ul')

    // 创建style标签
    var styleNodes = document.createElement('style')
    // 循环往ul中插入图片
    ulNodes.classList.add('imgList')
    for(var i = 0;i<imgArr.length;i++){
        ulNodes.innerHTML += '<li><a href="javascript:;" ><img src="'+imgArr[i]+'" alt=""></a></li>'
    }

    // 动态设置图片列表的宽度
    styleNodes.innerHTML = '.carousel-warp > .imgList > li{width: '+(1/imgArr.length)*100+'%;}.carousel-warp > .imgList{width: '+imgArr.length*100+'%}'


    carouselWarp.appendChild(ulNodes)
    document.head.appendChild(styleNodes)

    // 开启绝对定位后div失去了高度，需要重新设置高度
    var imgNodes = document.querySelector('.carousel-warp > .imgList > li > a > img')
    setTimeout(()=>{
    carouselWarp.style.height = imgNodes.offsetHeight+'px'
    },100)

    // 轮播图导航点
    var pointWrap = document.querySelector('.carousel-warp > .points-wrap')
    if(pointWrap){
        // 循环生成point
        for(var i = 0;i<pointslength;i++){
            if(i==0){
                // 为第一个span标签添加active属性
                pointWrap.innerHTML += "<span class='active'></span>"
            }else{
                pointWrap.innerHTML += "<span></span>"
            }
            var pointSpans = document.querySelectorAll('.carousel-warp > .points-wrap > span')
    }
    }
    /*
        滑屏
            1.拿到元素一开始的位置
            2.拿到手指一开始点击的位置
            3.拿到手指move实时移动的距离
            4.将手指移动的距离累加给元素
    */ 
    /*
        防抖动
        1.判断用户首次滑屏的方向
        2.如果是x轴 以后不管用户怎么滑都会都懂
        3.如果是y轴 以后不管用户怎么滑都不会抖动
    */
    var index = 0
    // 手指的位置
    var startX=0;
    var startY=0;
    // 元素的位置
    var elementX=0;
    var elementY=0;

    var isX = true;
    var isFirst = true;
    carouselWarp.addEventListener('touchstart',function(ev){
        ev = ev||event
        // 获取手指第一次点击的位置
        var touchC = ev.changedTouches[0]
        ulNodes.style.transition= 'none';

        // 无缝
        /*
            点击第一组的第一张时，瞬间跳到第二组的第一张
            点击第二组的最后一张时，瞬间跳到第一组的最后一张
        */
        if(needCarousel){
            var index = damu.css(ulNodes,"translateX")/document.documentElement.clientWidth
            if(index === 0){
                index = -pointslength
            }else if(index == 1-imgArr.length){
                index = -(pointslength-1)
            }
            damu.css(ulNodes,"translateX",index*document.documentElement.clientWidth)
        }

        // 获取手指点击时的X坐标
        startX = touchC.clientX;
        startY = touchC.clientY;
        // 获取元素的位置
        elementX = damu.css(ulNodes,'translateX');
        elementY = damu.css(ulNodes,'translateY');

        // 点击时清除定时器
        clearInterval(timer)

        // 用户第二次点击时重置防抖动状态
        isX = true;
        isFirst = true;

    })
    carouselWarp.addEventListener('touchmove',function(ev){
        ev = ev||event
        // isX如果为false，则说明用户在Y轴上移动，不执行下面语句
        // 防止二次抖动
        if(!isX){
            return
        }
        // 获取手指第一次点击的位置
        var touchC = ev.changedTouches[0]
        // 获取现在手指的X坐标
        var nowX = touchC.clientX;
        var nowY = touchC.clientY;
        // 手指移动的距离
        var disX = nowX - startX;
        var disY = nowY - startY;

        // 设置ulNodes的偏移量
        // translateX = elementX + disX
        // ulNodes.style.transform = 'translateX('+translateX+'px)'

        // 判断用户是否是第一次滑动，如果是则进入防抖动判断，防止重复判定
        if(isFirst){
            isFirst = false
            // 如果在Y轴上移动的距离大于X轴，则说明是在Y轴上滑动的，不触发滚动图的移动
            if(Math.abs(disY)>Math.abs(disX)){
                // 如果在Y轴上移动的距离大于X轴，将isX改为false
                isX = false
                // 首次防抖动
                return;
            }
        }
        damu.css(ulNodes,'translateX',elementX+disX)
        
        
    })
    carouselWarp.addEventListener('touchend',function(ev){
        ev = ev||event
        // index抽象了ul的实时位置
        // ulNodes的左偏移量除以视口宽度，计算出用户大致移动了几张图片
        index = damu.css(ulNodes,"translateX")/document.documentElement.clientWidth
        index = Math.round(index)

        // 超出控制
        if(index>0){
            index=0
        }else if(index<1-imgArr.length){
            index = 1-imgArr.length
        }
        xiaoyuandian(index)
        // 添加过渡效果
        ulNodes.style.transition= '1s transform';
        // 重新计算图片列表的偏移量
        // translateX = index*(document.documentElement.clientWidth)
        // ulNodes.style.transform = "translateX("+translateX+"px)"
        damu.css(ulNodes,"translateX",index*(document.documentElement.clientWidth))

        // 完成点击时重启定时器
        auto()
    })


    // 自动轮播
    var timer = 0
    // 抽象图片下标
    auto();
    function auto(){
        clearInterval(timer)
        timer = setInterval(() => {
            if(index == 1-imgArr.length){
            ulNodes.style.transition = "none"
                index = 1-imgArr.length/2
                damu.css(ulNodes,"translateX",index*document.documentElement.clientWidth)
            }
            setTimeout(() => {
                index--
                ulNodes.style.transition = "1s transform"
                xiaoyuandian(index)
                damu.css(ulNodes,"translateX",index*document.documentElement.clientWidth)
            }, 50);
        }, 2000);
    }

    function xiaoyuandian(index){
        for(var i = 0;i<pointSpans.length;i++){
            // 删除上一张图片的active属性
            pointSpans[i].classList.remove('active')
        }
        // 为当前索引的point添加active属性
        pointSpans[-index%pointslength].classList.add('active')
    }
    }
    w.damu.move = function(){
        // 滑屏区域
        var nav = document.querySelector('#wrap .content .nav')
        // 滑屏元素
        var navList = document.querySelector('#wrap .content .nav .list')
        var startX = 0;//开始点击的位置
        var elementX = 0;//元素所在的位置
        var minX = nav.clientWidth-navList.offsetWidth

        // 快速滑屏需要的参数
        var lastTime = 0;//手指按下时的时间
        var lastPoint = 0;//手指的移动距离
        var timeDis = 0;//经过的时间
        var pointDis = 0;//经过的距离
        nav.addEventListener('touchstart',function(ev){
            ev=ev||event
            var touchC = ev.changedTouches[0];

            // 获取手指点击时的位置
            startX = touchC.clientX;

            // 获取元素的位置
            elementX = damu.css(navList,'translateX')
            
            navList.style.transition = "none";

            // 获取手指按下时的时间
            lastTime = new Date().getDate;
            //获取手指的移动距离
            lastPoint = touchC.clientX;
        })

        nav.addEventListener('touchmove',function(ev){
            ev=ev||event
            var touchC = ev.changedTouches[0];

            // 获取元素当前的坐标
            var nowX = touchC.clientX;

            // 获取元素移动的距离
            var disX = nowX - startX
            var translateX = elementX+disX
            

            // 获取移动时的时间
            var nowTime = new Date().getDate();
            // 获取手指移动时的位置
            var nowPoint = touchC.clientX

            // 经过的时间
            timeDis = nowTime - lastTime
            // 手指经过的距离
            // 移到上面来，虽然第一次now和last都是0，但是可以使用pointDis来计算已经过的距离
            pointDis = nowPoint - lastPoint

            lastTime = nowTime;
            lastPoint = nowPoint

            /*
                橡皮筋效果
                    在move的过程中，每一次touchmove真正的有效距离都在变小，元素的滑动距离在慢慢变大

                    scale:慢慢变小的比例  比例的范围控制在了0-1之间
                    elementX：元素在touchstart时的位置
                    disX:整整一次move过程中手指移动的距离

                    pointDis:整个手指touchmove真正的有效距离
            */
            if(translateX>0){
                var scale = document.documentElement.clientWidth/((document.documentElement.clientWidth+translateX)*2)

                //使用elementX计算时，元素被点击时位置总为0，会导致计算出现问题，所以要使用实时移动的距离
                translateX = damu.css(navList,'translateX') + pointDis*scale
                // translateX = elementX + disX*scale

            }else if(translateX<minX){
                var over = minX - translateX
                var scale = document.documentElement.clientWidth/((document.documentElement.clientWidth+over)*2)
                translateX = damu.css(navList,'translateX') + pointDis*scale
                // translateX = elementX + disX*scale
            }
            damu.css(navList,"translateX",translateX)//第三个值为移动的距离
        })

        nav.addEventListener('touchend',function(ev){
            var translateX = damu.css(navList,"translateX");
            // 手指松开时计算移动时的平均速度
            var speed = pointDis/timeDis;

            // 手指松开后元素继续移动的距离
            var targetX = translateX + speed*200;
            
            
            var bsr = "";
            if(targetX>0){
                targetX=0;
                // bsr = "cubic-bezier(.26,1.51,.68,1.54)"
                // console.log(123);
                // translateX=0;
                // damu.css(item,"translateX",translateX);
            }else if(targetX<minX){
                targetX = minX;
                
                // translateX = minX;
                // console.log(456);
                // damu.css(item,"translateX",translateX);
            }
            
            navList.style.transition="1s transform";
            damu.css(navList,"translateX",targetX)
        })
    }
    /*
        防抖动  即点即停
        transition的问题
            1.元素在没有渲染完成时，无法触发过渡
            2.在transform切换下，如果前后transform属性值变换函数的位置个数不一样 无法切换过渡
            3.没有办法拿到transition中任何一帧的状态

                    --Tween算法

    */
    w.damu.vMove = function(nav){
        // 滑屏区域
        // 滑屏元素
        var navList = nav.children[0];
        damu.css(navList,'translateZ',0.1)
        var start = {};//开始点击的位置
        var element = {};//元素所在的位置
        var minY = nav.clientHeight-navList.offsetHeight
    
        // 快速滑屏需要的参数
        var lastTime = 0;//手指按下时的时间
        var lastPoint = 0;//手指的移动距离
        var timeDis = 0;//经过的时间
        var pointDis = 0;//经过的距离

        var clearTime

        var isY = true;
        var isFirst = true;
        var Tween={
            Linear: function(t,b,c,d){ return c*t/d + b; },
			back: function(t,b,c,d,s){
	            if (s == undefined) s = 1.70158;
	            return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
        	}

        }
        nav.addEventListener('touchstart',function(ev){
            ev=ev||event
            var touchC = ev.changedTouches[0];
            
            start = {clientX:touchC.clientX,clientY:touchC.clientY}
            // 获取手指点击时的位置
            startY = touchC.clientY;
    
            // 获取元素的位置
            element.y = damu.css(navList,'translateY')
            element.x = damu.css(navList,'translateX')
            
            navList.style.transition = "none";
    
            // 获取手指按下时的时间
            lastTime = new Date().getDate;
            //获取手指的移动距离
            lastPoint = touchC.clientY;

             isY = true;
             isFirst = true;
             
            clearInterval(clearTime)
        })
    
        nav.addEventListener('touchmove',function(ev){
            
            clearInterval(clearTime)
            if(!isY){
                return
            }
            console.log(isY);
            ev=ev||event
            var touchC = ev.changedTouches[0];
    
            // 获取元素当前的坐标
            // var nowY = touchC.clientY;
    
            // // 获取元素移动的距离
            // var disY = nowY - startY
            // var translateY = elementY+disY

            var now = touchC
            var dis = {};
            dis.y = now.clientY-start.clientY
            dis.x = now.clientX-start.clientX
            var translateY = element.y+dis.y
            
            
            if(isFirst){
                isFirst = false
                if(Math.abs(dis.x)>Math.abs(dis.y)){
                    isY = false;
                    return
                }
            }
            // 获取移动时的时间
            var nowTime = new Date().getDate();
            // 获取手指移动时的位置
            var nowPoint = touchC.clientY
    
            // 经过的时间
            timeDis = nowTime - lastTime
            // 手指经过的距离
            // 移到上面来，虽然第一次now和last都是0，但是可以使用pointDis来计算已经过的距离
            pointDis = nowPoint - lastPoint
    
            lastTime = nowTime;
            lastPoint = nowPoint
    
            /*
                橡皮筋效果
                    在move的过程中，每一次touchmove真正的有效距离都在变小，元素的滑动距离在慢慢变大
    
                    scale:慢慢变小的比例  比例的范围控制在了0-1之间
                    elementY：元素在touchstart时的位置
                    disY:整整一次move过程中手指移动的距离
    
                    pointDis:整个手指touchmove真正的有效距离
            */
            if(translateY>0){
                var scale = document.documentElement.clientHeight/((document.documentElement.clientHeight+translateY)*2)
    
                //使用elementY计算时，元素被点击时位置总为0，会导致计算出现问题，所以要使用实时移动的距离
                translateY = damu.css(navList,'translateY') + pointDis*scale
                // translateY = elementY + disY*scale
    
            }else if(translateY<minY){
                var over = minY - translateY
                var scale = document.documentElement.clientHeight/((document.documentElement.clientHeight+over)*2)
                translateY = damu.css(navList,'translateY') + pointDis*scale
                // translateY = elementY + disY*scale
            }
            damu.css(navList,"translateY",translateY)//第三个值为移动的距离
        })
    
        nav.addEventListener('touchend',function(ev){
            var translateY = damu.css(navList,"translateY");
            // 手指松开时计算移动时的平均速度
            var speed = pointDis/timeDis;
            var time = Math.abs(speed)*0.2;
            time = time<0.8?0.8:time;
            var type = 'Linear'
            // 手指松开后元素继续移动的距离
            var targetY = translateY + speed*200;
            
            
            if(targetY>0){
                targetY=0;
                // bsr = "cubic-bezier(.26,1.51,.68,1.54)"
                // console.log(123);
                // translateY=0;
                // damu.css(item,"translateY",translateY);
            }else if(targetY<minY){
                targetY = minY;
                
                // translateY = minY;
                // console.log(456);
                // damu.css(item,"translateY",translateY);
            }
            bsr(type,time,targetY)
            navList.style.transition="1s transform";
            damu.css(navList,"translateY",targetY)

        })
        function bsr(type,time,targetY){
            clearInterval(clearTime)
            // 当前次数
            var t = 0;
            // 初始位置
            var b = damu.css(navList,"translateY")
            // 最终位置-初始位置
            var c = targetY-b
            // 总次数
            var d = time*1000/(1000/60)
            var clearTime = setInterval(function(){
                t++
				
				if(t>d){
					clearInterval(cleartime);
				}
                var point = Tween[type](t,b,c,d)
                damu.css(navList,'translateY',point)
            },1000/60)
        }
    }

})(window)