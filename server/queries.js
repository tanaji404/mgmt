// query for create table start 

var create=function(tname,obj)
{
    var sql=`CREATE TABLE `+tname+`
         (${tname}_id int primary key AUTO_INCREMENT`;
 

        objkeys=Object.keys(obj);
         console.log(objkeys);
        for(i=0;i<objkeys.length;i++)
         {
            sql+=`, ${objkeys[i]} text`;
         }

         sql+=`)`;
         return sql;
}
// query for create table end

// query for inser in the table start 
var insert=function(tname,obj)
{
    var sql=`INSERT INTO `+tname+` (`;
        objkeys=Object.keys(obj);
        //  console.log(objkeys);
        for(i=0;i<objkeys.length;i++)
         {
            if(i!=0)
            sql+=`,${objkeys[i]} `;
            else
            sql+=`${objkeys[i]} `;

         }
         sql+=`) VALUES ( `;
         objvalues=Object.values(obj);
        //  console.log(objvalues);
        for(i=0;i<objvalues.length;i++)
         {
            if(i!=0)
            sql+=`,'${objvalues[i]}' `;
            else
            sql+=`'${objvalues[i]}' `;

         }
         sql+=`)`;

         return sql;
}
// query for inser in the table end

// query for select start 
var select=function(tname)
{
  var sql=`SELECT * FROM ${tname}`;

  return sql;
}
// query for select end

module.exports={create,insert,select}