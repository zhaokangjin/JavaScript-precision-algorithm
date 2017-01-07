
/**
kangjin Super high precision
@author:kangjin.zhao(赵康进)
@email:kangjin.zhao@accenture.com ;zhaokangjin1@huawei.com; 270882007@qq.com
@since:2016-06-08 适用于各种浏览器
@version 2.1.realease
有任何使用疑惑或关于此算法的交流意见请发邮件kangjin.zhao@accenture.com ;zhaokangjin1@huawei.com; 270882007@qq.com
本算法是针对浏览器的超高精度算法，1万位的小数精度可以秒级完成，百万级的精度大约需要几分钟时间
即便是java里的BigDecimal 的小数精度，在这个算法下也相形见绌。
本算法借鉴了中国古代的算盘，运算中用内存构建了一个几乎可以无限拓展的算盘模型。
本算法重构了加减乘除以及四舍五入的的基本算法，解决了浏览器领域（javascript)的高精度问题，填补了业界这一空白
*/
"use strict";
/*
@author:kangjin.zhao;shijian.lin 
@email:kangjin.zhao@accenture.com ;270882007@qq.com
@since:2016-06-08
@version 2.1.realease
@parameter 子类对象 
@parameter 父类对象
@return 返回子类对象，子类对象已经继承了父类对象的方法

定义继承体系，防止Function原型污染，由shijian.lin 林诗健改造  linshijian@huawei.com
本算法遵守这个继承体系
*/
var fnExtends=function(subFn,superClsass){
	if(typeof superClsass!=="function"){
		throw new Error("父类必须为函数");
	}
	function tempFn(){};
	tempFn.prototype=superClsass.prototype;
	subFn.prototype=new tempFn();
	subFn.prototype.constructor=subFn.constructor;
	subFn.superClass=superClsass;

	return subFn;
}
/**
@author:kangjin.zhao;shijian.lin 
@email:kangjin.zhao@accenture.com ;270882007@qq.com
@since:2016-06-08
@version 2.1.realease

Calculator定义了父类，该父类定义了多种私有方法，为子类提供计算支撑
*/
function Calculator(){

};


/**
两个无符号单数字构成的长度相等的数组比较数字大小prototype
@author:赵康进
@email:kangjin.zhao@accenture.com ;270882007@qq.com
@parameter arr1 例如[1,2,3]
@parameter arr2 例如[1,2,4]
@return bool 
*/
Calculator.prototype._compareArrABS=function(arr1,arr2){
	if(this._compareStrNum(arr1.join(""),arr2.join(""))){
		return true;
	}else{
		return false;
	}
}
/**
比较两个无符号,无小数点字符型数字串的大小
@author:赵康进
@email:kangjin.zhao@accenture.com ;270882007@qq.com
@parameter strNum1 例如: "123"
@parameter strNum2 例如: "124"
@return bool 
*/
Calculator.prototype._compareStrNum=function(strNum1,strNum2){
	if(strNum1===strNum2){
		return true;
	}
	var temp=this._amplify(strNum1,strNum2);
	var a=temp.str1,b=temp.str2;
	if(a.length>b.length){
		return true;
	}else if(a.length<b.length){
		return false;
	}else if(a.length===b.length){
		for(var i=0;i<a.length;i++){
			if(parseInt(a.substr(i,1),10)>parseInt(b.substr(i,1),10)){
				return true;
			}else  if(parseInt(a.substr(i,1),10)<parseInt(b.substr(i,1),10)){
				return false;
			}
		}	
	}
}
/**
把有符号数字（字符型或数字型）转换为字符串表示的数值
@author:赵康进
@email:kangjin.zhao@accenture.com ;270882007@qq.com
@parameter 数值型或字符串型数值，包括浮点型的数值，例如： -2.1e-15   1.5e+4

@return String 用字符串表示的数字
例如：123 被转换后  "123"
    "123" 被转换后  "123"
	1.23e-15 被转换后 "0.0000000000000123"
	但限于数字的特殊性，比如：1000000000000.0000000000001  这类数字的小数部分会被忽略，或者一个过大的数，超过浏览器的数字范围，结尾会被忽略，面对这种情况，如果因为业务需要超级精度，建议采用字符串来描述数字，比如"1000000000000.0000000000001" 而不是 1000000000000.0000000000001 
	因此字符串表示的数字的计算精度会远远高于数字型的精度，尽管如此，针对数字的精度要比浏览器的基本算法（位移运算）要高出很多
    这是兼容数字型的计算方法，能够确保数字型的数字计算的超高精度
*/
Calculator.prototype._num2str=function(obj){
	if(typeof obj==="string"){
		return obj;
	}
	if(typeof obj ==="number"){
		var numStr=obj.toString();
		if(Utils.valid.regExp.lge.test(numStr)){
			var sign="";
			if(numStr.substr(0,1)==="-"){
				sign="-";
				numStr=numStr.substr(1);
			}
			var tempArr=numStr.split("e");
			var baseNumArr=tempArr[0].split(".");
			var smallNumLen=baseNumArr.length>1?baseNumArr[1].length:0;
			var power=tempArr[1].substr(1);
			var zerofill="";
			for(var i=0;i<power-smallNumLen-1;i++){
				zerofill+="0";
			}
			//解析形如 -2.1e-15   1.5e+4
			if(tempArr[1].substr(0,1)==="-"){
				//浮点型小于1的字符型表达式
				return sign+"0."+zerofill+baseNumArr[0]+(baseNumArr[1]?baseNumArr[1]:"");
			}else{
				//浮点型大于1的字符型表达式
				return sign+baseNumArr[0]+(baseNumArr[1]?baseNumArr[1]:"")+zerofill+"0";
			}
		}else{
			return numStr;
		}
	}
}
/**
返回两个操作数相乘或相除得到的符号，依据是同号得正，异号得负的原理
@author:赵康进
@email:kangjin.zhao@accenture.com ;270882007@qq.com
@parameter 数值型或字符串型数值，包括浮点型的数值，例如： -2.1e-15   1.5e+4
@return String 正负符号，负号用"-"表示，正号用空串表示
*/
Calculator.prototype._mulSign=function(strNum1,strNum2){
	if((Utils.valid.regExp.regExpZero.test(strNum1)|Utils.valid.regExp.regExpZero.test(strNum2))
		|strNum1.split("-").length===strNum2.split("-").length){
		return "";
	}else{
		return "-";
	}
}
/**
对无符号的两个字符串同时放大相同倍数，去掉小数点
@author:赵康进
@email:kangjin.zhao@accenture.com ;270882007@qq.com
@parameter strNum1 例如: "123.12"
@parameter strNum2 例如: "124.1"
@return JSON {str1:"12312",str2："12410",le:4,sm:3}
*/
Calculator.prototype._amplify=function(strNum1,strNum2){
	var arr1=strNum1.split(".");
	var arr2=strNum2.split(".");
	var len1=arr1[1]?arr1[1].length:0;
	var len2=arr2[1]?arr2[1].length:0;
	var n=len1>=len2?len1-len2:len2-len1;
	var zeros="";
	var result={};
	for(var i=0;i<n;i++){
		zeros+="0";
	}
	if(zeros===""){
		result.str1=arr1[0]+(arr1[1]?arr1[1]:"");
		result.str2=arr2[0]+(arr2[1]?arr2[1]:"");
	}else{
		if(len1>=len2){//0.01,300  >>>1 ,30000
			result.str1=arr1[0]+arr1[1];
			result.str2=arr2[0]+(arr2[1]?arr2[1]:"")+zeros;
		}else{
			result.str1=arr1[0]+(arr1[1]?arr1[1]:"")+zeros;	
			result.str2=arr2[0]+arr2[1];	
		}
	}
	var tempM=0,tempN=0,strM=result.str1,strN=result.str2;
	for(var m=0;m<strM.length;m++){
		if(strM.substr(m,1)!=="0"){
			break;
		}
		tempM++;
	}
	result.str1=strM.slice(tempM);
	for(var n=0;n<strN.length;n++){
		if(strN.substr(n,1)!=="0"){
			break;
		}
		tempN++;
	}	
	result.str2=strN.slice(tempN);
	result.le=len1+len2+n;
	result.sm=len1+len2;
	return result;
}
//对两个字符串同时放大相同倍数，去掉小数点，并记录小数点的总长度
Calculator.prototype._mulAmplify=function(strNum1,strNum2){
	var arr1=strNum1.split(".");
	var arr2=strNum2.split(".");
	var len1=arr1[1]?arr1[1].length:0;
	var len2=arr2[1]?arr2[1].length:0;
	var n=len1>=len2?len1-len2:len2-len1;
    var result={};
	var strM= arr1.length>1?arr1[0]+arr1[1]:arr1[0];
	var strN= arr2.length>1?arr2[0]+arr2[1]:arr2[0];
	result.str1=strM;
	result.str2=strN;
	
	result.le=len1+len2+n;
	//所有小数点位数
	result.sm=len1+len2;
	return result;
}

//被除数和除数的除法运算；被除数，除数
Calculator.prototype._devidePower=function(dividend,divisor,n){
	if(Utils.valid.regExp.regExpZero.test(dividend)){
		return [0];
	}
	var lazyN=false;
	if(!n && !Utils.valid.regExp.regExpNonNegtiveInt.test(n)){
		n=12;
		lazyN=true;
	}
	var len=divisor.length;
	var num=parseInt(divisor,10);
	var flag=true;//当小数位数达到指定精度时，标记为false,退出循环体
	//定义除法轮次
	var i=0;
	//定义小数轮次，如果小数轮次和n相等，则退出循环
	var j=0;
	//定义小数点的标记，第一次满足添加小数点时标记
	var dotFlag=true;
	var result=[];
	//初始化第一次被除数的最高几位数，做第一个轮次除法
	var subDivi=dividend.substr(0,len);
	while(flag){
		//临时被除数，从最高位截取除数长度
		var temp=parseInt(subDivi,10);
		//余数  1=1%3
		var remainder=temp%num;  
		//商  0=(1-1%3)/3
		var quotient =(temp-temp%num)/num;

		result.push(quotient);
	
		if(dividend.substr(i+len,1)===""){
			if(remainder===0 && lazyN){
				flag=false;
			}else{
				if(dotFlag && n!=0){
					result.push(".");
					dotFlag=false;			
				}			
			}
			subDivi=remainder+"0";
			j++;		
		}else{
			subDivi=remainder+dividend.substr(len+i,1);
		}		
		if(j===n+1){
			flag=false;
		}
		i++;
	}
	return result;
}

//判断减法相减的结果的正负
Calculator.prototype._sign=function(strNum1,strNum2){
	var a=strNum1.split("-");
	var b=strNum2.split("-");
	if(a.length===b.length && a.length==2){
		//结果为负数
		return false;
	}else if(a.length===b.length && a.length==1){
		//结果为正数
		return true;
	}else if(a.length!==b.length && a.length===1){
		////a>=0,b<0
		if(a[0]>=b[1]){
			return true;
		}else if(a[0]<b[1]){
			return false;
		}
	}else if(a.length!==b.length && b.length===1){
		//a<0,b>=0
		if(a[1]>=b[0]){
			return false;
		}else if(a[1]<b[0]){
			return true;
		}
	}
}
//两个相同长度的数组相加

Calculator.prototype._addArr=function(arr1,arr2){
	var a=arr1.slice(0);
	var b=arr2.slice(0);
	var len=arr1.length;
	var result=[];
	for(var i=len-1;i>0;i--){
		if(a[i]!=="."){
			var m=a[i]+b[i];
			if(m>9){
				if(a[i-1]==="."){
					a[i-2]=a[i-2]+1;
				}else{
					a[i-1]=a[i-1]+1;
				}
				
				result.splice(0,0,m-10);
			}else{
				result.splice(0,0,m);
			}
		}else{
			result.splice(0,0,".");
		}
	}
	if(a[0]+b[0]>9){
		result.splice(0,0,a[0]+b[0]-10);
		result.splice(0,0,1);
	}else{
		result.splice(0,0,a[0]+b[0]);
	}
	return result;
}

//无符号两个相同长度的数组相减
Calculator.prototype._minusArr=function(arr1,arr2){
	var a=arr1.slice(0);
	var b=arr2.slice(0);
	var len=arr1.length;
	var result=[];
	if(this._compareArrABS(a,b)){
		return this._minusArrUtils(a,b);
	}else{
		return this._minusArrUtils(b,a);
	}
}

//两个相同长度的数组减，第一个参数绝对值比第二个绝对值大
Calculator.prototype._minusArrUtils=function(arr1,arr2){
	var a=arr1.slice(0);
	var b=arr2.slice(0);
	var len=arr1.length;
	var result=[];
	for(var i=len-1;i>=0;i--){
		var m=a[i]-b[i];
		if(a[i]!=="."){
			if(m<0){
				if(a[i-1]==="."){
					a[i-2]=a[i-2]-1;
				}else{
					a[i-1]=a[i-1]-1;
				}
				result.splice(0,0,a[i]+10-b[i]);
			}else{
				result.splice(0,0,m);
			}
		}else{
			result.splice(0,0,".");
		}
	}
	return result;
}
//把两个数字型字符串加工成相同长度的数组，小数点对齐  a:strNum1,b:strNum2
Calculator.prototype._fillArrZero=function(strNum1,strNum2){
	var result={};
	var temp={};
	var arr1=strNum1.split(".");
	var arr2=strNum2.split(".");
	var _a={};
	var _b={};
	var leftLen=arr1[0].length-arr2[0].length;
	if(leftLen>0){
		arr2[0]=this._fillZero(leftLen)+arr2[0];
	}else{
		arr1[0]=this._fillZero(-leftLen)+arr1[0];
	}
	_a.int=arr1[0].split("");
	_b.int=arr2[0].split("");
	if(arr1[1]||arr2[1]){
		var aRight=arr1[1]?arr1[1]:"";
		var bRight=arr2[1]?arr2[1]:"";
		var rightLen=aRight.length-bRight.length;
		if(rightLen>0){
			bRight+=this._fillZero(rightLen)
		}else{
			aRight+=this._fillZero(-rightLen)
		}
		_a.decimal=aRight.split("");
		_b.decimal=bRight.split("");
		
	}
	temp.left=_a;
	temp.right=_b;
	if(temp.left.decimal){
		result.arr1=temp.left.int.concat(".",temp.left.decimal);
		result.arr2=temp.right.int.concat(".",temp.right.decimal);
	}else{
		result.arr1=temp.left.int;
		result.arr2=temp.right.int;
	}
	for(var i=0;i<result.arr1.length;i++){
		if(result.arr1[i]!=="."){
			result.arr1[i]=parseInt(result.arr1[i],10);
			result.arr2[i]=parseInt(result.arr2[i],10);		
		}
	}
	return result;
}
//给指定的字符串补充零占位
Calculator.prototype._fillZero=function(n){
	var zero="";
	for(var i=0;i<n;i++){
		zero+="0";
	}
	return zero;
}
//把字符型数字数组转为整数型数组
Calculator.prototype._parInt=function(arr){
	for(var i=0;i<arr.length;i++){
		arr[i]=parseInt(arr[i],10)
	}
	return arr;
}
//去掉前置无效零
Calculator.prototype._clearArrPreZero=function(strInt){
	//去掉001
	var count=0;
	for(var f=0;f<strInt.length-1;f++){
		if(strInt[f]!==0){
			break;
		}
		count++;
	}
	return strInt.slice(count);
}

//单个数字乘以数组[3],3
Calculator.prototype._nMulti=function(multiplier,n){
	//var arr1=this._clearArrPreZero(multiplier);
	var arr1=multiplier.slice(0);
	var result=[0],len=arr1.length;
	for(var i=len-1;i>=0;i--){
		var cur=result[0];
		var temp=arr1[i]*n+cur;
		var rem=temp%10;
		result[0]=rem;
		var high=(temp-temp%10)/10;
		if(i===0 && high===0){
			break;
		}
		result.splice(0,0,high);
	}
	return result;
}
//数组和数组相乘
Calculator.prototype._arrMulti=function(multiplierArr,faciendArr){
	var arr1=multiplierArr.slice(0);
	var arr2=faciendArr.slice(0);
	var len2=arr2.length,len1=arr1.length;
	var j=0,result="0";
	var add=new Add();
	for(var i=len2-1;i>=0;i--){
		var zeros=[];
		for(var  k=0;k<j;k++){
			zeros.push(0);
		}
		result=add.add(result,this._nMulti(arr1,arr2[i]).concat(zeros).join(""));
	    j++;	
	}
	return result;
}
//去掉冗余的零
Calculator.prototype._clearZeros=function(arr){
	var copyArr;
	if(arr instanceof Array){
		copyArr=arr.join("");
	}else{
		copyArr=arr;
	}
	if(Utils.valid.regExp.regExpZero.test(copyArr)){
		var result=copyArr.split(".");
		return "0."+result[1];
	}else{
		return copyArr;
	}	
}
//四则混合运算 被加字符串和精度
Calculator.prototype._arithmetic=function(stringObj,n){
	
	//{2+3*5-(33-3/4)}
	
}

function Add(){};

fnExtends(Add,Calculator);

Add.prototype.add=function(){
	Calculator.call(this);
	if(arguments.length===0){
		throw new Error("必须有加数");
		return;
	}	
	var arrAdd=arguments;
	if(arguments[0] instanceof Array){
		arrAdd=arguments[0].slice(0);
	}
	var result=this._num2str(arrAdd[0]);
	if(arrAdd.length===1){
		return result;
	}
	for(var i=0;i<arrAdd.length-1;i++){
		var param=this._num2str(arrAdd[i+1]);
		var sign=this._sign(result,param);
		var a=result.split("-"),b=param.split("-");
		var _a=a.length===1?a[0]:a[1],_b=b.length===1?b[0]:b[1];
		var json=this._fillArrZero(_a,_b);
		var temp;
		if(a.length===b.length){
			temp=this._addArr(json.arr1,json.arr2).join("");
			result=sign?temp:"-"+temp; 
		}else{
			temp=this._minusArr(json.arr1,json.arr2).join("");
			result=this._clearZeros(sign?temp:"-"+temp); 
		}
	}
	return result;
};
	
function Fixed(){};

fnExtends(Fixed,Calculator);

Fixed.prototype.toFixed=function(strNum1,n){
	Calculator.call(this);
	strNum1=this._num2str(strNum1);
	if(!Utils.valid.regExp.number.test(strNum1)){
		throw new Errors("参数不能被转化为有效的数字");
	}		
	if(!Utils.valid.regExp.regExpNonNegtiveInt.test(n)){
		throw new Error("四舍五入位数必须是非负整数");
		return;
	}
	var sign=strNum1.split("-").length>1?"-":"";
 	var add=new Add();
    if(n===0){
		var arrZ=strNum1.split(".");
		if(arrZ.length==1 || parseInt(arrZ[1].substr(0,1),10)<5){
			return arrZ[0];
		}else{
			return add.add(arrZ[0],sign+"1");
		}
	}
	var zero="0.",one="0.",result;
	for(var i=0;i<n;i++){
		zero+="0";
		if(i!==(n-1)){
			one+="0";
		}
	}
	zero+="0";//0.00
	one+="1";//0.1
	var temp=add.add(strNum1,zero);
	var dotAt=temp.indexOf(".");
	var at=dotAt+n+1;
	var cut=temp.substring(0,at+1);
	var lnum=parseInt(cut.charAt(at),10);
	if(lnum>=5){
		result=add.add(cut,sign+one).substring(0,at);
	}else{
		result=temp.substring(0,at);
	}
	return result;
}
//给String 类扩展四舍五入方法
String.prototype.toFixed=function(n){
	var fix=new Fixed();
	return fix.toFixed(this,n);
}
function Multiplication(){};

fnExtends(Multiplication,Calculator);

Multiplication.prototype.multiply=function(strNum1,strNum2){
	Calculator.call(this);
	strNum1=this._num2str(strNum1);
	strNum2=this._num2str(strNum2);
	if(!Utils.valid.regExp.number.test(strNum1) || !Utils.valid.regExp.number.test(strNum2)){
		throw new Errors("参数不能被转化为有效的数字");
	}	
	var sign=this._mulSign(strNum1,strNum2)
	var a1=strNum1.split("-");
	var a2=strNum2.split("-");
	var s1=a1.length>1?a1[1]:a1[0];
	var s2=a2.length>1?a2[1]:a2[0];
	var temp=this._mulAmplify(s1,s2);
	var nArr1=[];
	var result=this._arrMulti(this._parInt(temp.str1.split("")),this._parInt(temp.str2.split("")));
	var n=temp.sm;
	var at=result.length-n;
	if(n===0){
		return sign+result;
	}
	var left=result.substr(0,at);
	if(Utils.valid.regExp.regExpAllZero.test(left)){
		left="0";
	}else{
		var count=0;
		var ar1=left.split("");
		for(var i=0;i<ar1.length;i++){
			if(ar1[i]!=="0"){
				break;
			}else{
				count++;
			}
		}
		left=left.substr(count);
	}
	var right=result.substr(at);
	return result=sign+left+"."+right;
}
//给String 类扩展乘法
String.prototype.multiply=function(){
	var mul=new Multiplication();
	var param=this.split(/[\*|×]/);
	return mul.multiply(param[0],param[1]);
}
function Division(){};

fnExtends(Division,Calculator);

Division.prototype.divise=function(dividend,divisor,n){
	Calculator.call(this);
	dividend=this._num2str(dividend);
	divisor=this._num2str(divisor);
	if(!Utils.valid.regExp.number.test(dividend) || !Utils.valid.regExp.number.test(divisor)){
		throw new Errors("参数不能被转化为有效的数字");
	}
	var sign=this._mulSign(dividend,divisor)
	var temp1=dividend.split("-");
	var temp2=divisor.split("-");
	var t1=temp1.length>1?temp1[1]:temp1[0];
	var t2=temp2.length>1?temp2[1]:temp2[0];
	var temp=this._amplify(t1,t2);
	var a=temp.str1,b=temp.str2,t;
	var result=this._devidePower(a,b,n);
	if(result[0]===0 && result[1]!=="."){
		result.splice(0,1)
	}
	return sign+result.join("") ;
}
//给String 类扩展除法，非常优雅
String.prototype.divise=function(n){
	var div=new Division();
	var param=this.split(/[\/|÷]/);
	return div.divise(param[0],param[1],n);
}
//给Array 类扩展加法，非常优雅
Array.prototype.add=function(stringObj){
	obj="2*5+4";
	if(this.length>0 && Utils.valid.arrays.isAllNumber(this)){
		var add=new Add();
		return add.add(this)	
	}
	throw new Errors("数组元素有非数字元素");
}