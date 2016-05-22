//less->css->autoprefixr
//watch less to auto above flow
module.exports = function(grunt){
	"use strict";
	//auto load all nessary plugin
    //require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
	grunt.loadNpmTasks('grunt-postcss');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	//check if css synax correct
	grunt.loadNpmTasks('grunt-contrib-csslint');
	
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		origCssPath:'./public/stylesheets/private',
		watch:{
			less2autoprefix:{
				files:[
				'<%=origCssPath%>/*.less'
					// {
					  // expand:true,     // Enable dynamic expansion.
					  // cwd:'<%=origCssPath%>',      // Src matches are relative to this path.
					  //src:['<%=origCssPath%>/**/*.less'], // Actual pattern(s) to match.
					  // dest:'<%=origCssPath%>',   // Destination path prefix.
					  ////ext: '.min.js',   // Dest filepaths will have this extension.
					  ////extDot: 'first'   // Extensions in filenames begin after the first dot						
					// },
				],
				tasks: ['less:main','postcss:main'],
			}
		},
		//use grunt-contrubite-less since plugin post-less in developing
		less:{
			options:{
				// paths:['./public/stylesheets/private/'],//无需，直接在files中指定路径+文件名即可
				// rootPath:'./public/stylesheets/private/',//无需，直接在files中指定路径+文件名即可
				compress:false,
				strictImports:true,
				strictMath:true,
				strictUnits:false,//enable 3*5px=15px
				syncImport:true,
			},
			main:{
				//////files can set multiple src-target
				files:[
					{
						expand:true,
						cwd:'<%=origCssPath%>',
						src:'./private/*.less',
						dest:'./private',
						ext:'.css',
						extDot:'first',
						
					},
				],				
			},			
		},
		//autoprefixr
		postcss:{
			options: {
				map: false,
				processors: [
					require('autoprefixer')({
						browsers: ['last 2 versions']
					})
				]
			},			
			main:{
				
				files:[
					{
						expand:true,
						// cwd:'<%=origCssPath%>',//不能使用cwd，否则及时运行了task，也不会添加对应的prefix？
						src:'<%=origCssPath%>/*.css',
					}
				],
			},
		},
		//check if css valid(no quite good since not print line number)
		csslint:{
			options:{
				quite:true,//only show waring
				'box-model':2,
			},
			main:{
				files:[
					{
						expand:true,
						cwd:'<%=origCssPath%>',						
						src:'./public/stylesheets/admin.css',
					}
				],
			},
		},
	});	
	
	grunt.registerTask('default', ['less:main','postcss:main']);
}
