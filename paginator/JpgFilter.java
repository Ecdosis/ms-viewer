import java.io.FilenameFilter;
import java.io.File;
class JpgFilter implements FilenameFilter
{
    public boolean accept(File dir, String name)
    {
        boolean found = name.endsWith(".jpg");
        return found;
    }
}

