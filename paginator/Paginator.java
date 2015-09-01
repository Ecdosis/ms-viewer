import java.io.File;
import java.io.FileInputStream;
import java.io.FilenameFilter;
import org.json.simple.JSONObject;
import org.json.simple.JSONArray;
import org.json.simple.JSONValue;
import java.util.HashMap;
import java.util.Arrays;
public class Paginator
{
    static String readFile( String path )
    {
        try
        {
            File f = new File(path);
            if ( f.exists() )
            {
                FileInputStream fis = new FileInputStream(f);
                byte[] data = new byte[(int)f.length()];
                fis.read(data);
                return new String(data);
            }
            else
                System.out.println(path+" doesn't exist");
        }
        catch ( Exception e )
        {
            //return empty string if it fails
        }
        return "";
    }
    static String[] listJpgs( String dir )
    {
        File d = new File( dir );
        if ( d.exists() && d.isDirectory() )
            return d.list(new JpgFilter());
        else
        {
            System.out.println(d.getAbsolutePath()+" does not exist");
            return new String[0];
        }
    }
    static String getOrientation( int num, boolean rectoIsOdd )
    {
        if ( rectoIsOdd )
        {
            if ( num%2==0 )
                return "v";
            else
                return "r";
        }
        else
        {
            if ( num%2==0 )
                return "r";
            else
                return "v";
        }
    }
    static int getFileNum( String name )
    {
        String subname = name.substring(0,name.indexOf(".jpg"));
        return Integer.parseInt(subname);
    }
    static JSONObject cleanSpec( JSONObject jobj )
    {
        String src = (String)jobj.get("src");
        int num = getFileNum(src);
        if ( !jobj.containsKey("o") )
        {
            jobj.put( "o", getOrientation(num,true) );
        }
        return jobj;
    }
    static boolean isRectoOdd( JSONObject jobj )
    {
        String src = (String)jobj.get("src");
        int num = getFileNum(src);
        String orientation = (String)jobj.get("o");
        if ( orientation == "r" && num%2==1 )
            return true;
        else if ( orientation=="v" && num%2==0 )
            return true;
        else 
            return false;
    }
    static boolean isRoman( String name )
    {
        name = name.toLowerCase();
        try
        {
            int value = RomanNumeral.valueOf(name);
            return true;
        }
        catch ( Exception e )
        {
            return false;
        }
    }
    static String incRoman( String numerus )
    {
        try
        {
            int number = RomanNumeral.valueOf(numerus.toUpperCase());
            return RomanNumeral.convertToRoman(number+1).toLowerCase();
        }
        catch ( Exception e )
        {
            return "";
        }
    }
    static String incName( String name )
    {
        try
        {
            if ( isRoman(name) )
            {
                return incRoman(name);
            }
            else 
            {
                int i=0;
                for ( i=0;i<name.length();i++ )
                {
                    if ( !Character.isDigit(name.charAt(i)) )
                        break;
                }
                if ( i == name.length() )   // it's arabic
                {
                    int num = Integer.parseInt(name);
                    return Integer.toString(num+1);
                }
                else if ( i > 0 )
                {
                    String intPart = name.substring(0,i);
                    int value = Integer.parseInt(intPart)+1;
                    return Integer.toString(value) + name.substring(i);
                }
                else
                    throw new Exception("invalid page number "+name);
            }
        }
        catch ( Exception e )
        {
            System.out.println(e.getMessage());
            return "1";
        }
    }
    public static void main( String[] args )
    {
        if ( args.length==2 )
        {
            String json = readFile(args[1]);
            String[] files = listJpgs(args[0]);
            if ( files.length==0 )
                System.out.println("No .jpg files found in "+args[0]);
            else
            {
                JSONObject jObj = (JSONObject)JSONValue.parse(json);
                Arrays.sort(files);
                JSONArray specials = (JSONArray)jObj.get("specials");
                HashMap<String,JSONObject> map = new HashMap<String,JSONObject>();
                for ( int i=0;i<specials.size();i++ )
                {
                    JSONObject special = (JSONObject)specials.get(i);
                    JSONObject cleaned = cleanSpec(special);
                    map.put((String)special.get("src"),cleaned);
                }
                boolean rectoIsOdd = true;
                JSONObject last = null;
                JSONArray dest = new JSONArray();
                for ( int i=0;i<files.length;i++ )
                {
                    if ( map.containsKey(files[i]) )
                    {
                        last = map.get(files[i]);
                        dest.add(last);
                    }
                    else
                    {
                        JSONObject elem = new JSONObject();
                        rectoIsOdd = isRectoOdd(last);
                        String orientation = getOrientation(getFileNum(files[i]),rectoIsOdd);
                        elem.put("n",(last==null)?"1":incName((String)last.get("n")));
                        elem.put( "src",files[i]);
                        elem.put("o",orientation);
                        last = elem;
                        dest.add( elem );
                    }
                }
                System.out.println(dest.toJSONString());
            }
        }
        else
            System.out.println("usage: java Paginator <folder> <json-config>");
    }
}

