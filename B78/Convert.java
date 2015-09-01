import java.io.FileOutputStream;
import java.io.File;
import java.util.Arrays;
import java.util.ArrayList;
public class Convert
{
    public static void main(String[] args )
    {
        try {
        File[] all = new File(".").listFiles();
        Arrays.sort(all);
        ArrayList<String> edits = new ArrayList<String>();
        int j = 1;
        for ( int i=0;i<all.length;i++ )
        {
            if ( all[i].isFile() && all[i].getName().endsWith(".jpg"))
            {
                String name = all[i].getName();
                String oldName,newName;
                if ( name.contains("-0") )
                    oldName = name.replace("-0","a");
                else 
                    oldName = name.replace("-1","b");
                if ( i < 10 )
                    newName = "0000000"+j+".jpg";
                else if ( i < 100 )
                    newName = "000000"+j+".jpg";
                else
                    newName = "00000"+j+".jpg";
                j++;
                edits.add("s/"+oldName+"/"+newName+"/");
                if ( !all[i].renameTo(new File(newName)) )
                    System.out.println("Couldn't rename "+name);
            }
        }
        FileOutputStream fos = new FileOutputStream(new File("edits.sed"));
        for ( int i=0;i<edits.size();i++ )
        {
            fos.write(edits.get(i).getBytes());
            fos.write("\n".getBytes());
        }
        fos.close();
        }
        catch ( Exception e )
        {
            e.printStackTrace(System.out);
        }
    }
}
