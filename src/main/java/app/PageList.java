package app;

import java.util.TreeSet;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

public class PageList extends TreeSet<String> {
	private static final long serialVersionUID = 4630317698003139029L;
	PageList() {
		this.update();
	}

	PageList update() {
		this.clear();
		try {
			PathMatchingResourcePatternResolver loader = new PathMatchingResourcePatternResolver();
			Resource[] resources = loader.getResources("classpath:/templates/*.*");
			for( Resource resource : resources ) {
				String path = resource.getURL().toExternalForm();
				int index = path.indexOf( "templates" );
				if( 0 <= index && path.endsWith( ".html" ) && ! path.endsWith( "index.html" ) ) {
					this.add( path.substring( index + "templates".length() + 1, path.length() - ".html".length() ) );
				}
			}
		} catch( Exception e ) {
			// DO NOTHING
		}
		return this;
	}
}
