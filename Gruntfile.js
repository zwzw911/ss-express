module.exports = function(grunt){
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		orig_path:'./',
		dist_path:'dist',
		should_be_deal_folder:'bin,maintain,public,routes,user_icon,views'
		//dist:'dist',
		clean:{
			src:'dist/**'
		},
		copy:{
			main:{					
				files:[
					{
						expand: true,
						flatten:false,
						src:['<%=orig_path%>/{<%=should_be_deal_folder%>}/**','<%=orig_path%>/index{.php,.html}',//css,inc,js需要特殊处理
						//js,以下需要直接copy，而不用min的
						'<%=orig_path%>/js/*.min.js','<%=orig_path%>/js/kindeditor/**/*','<%=orig_path%>/js/plupload/**/*',
						//css,以下需要直接copy，而不用min的
						'<%=orig_path%>/css/ztree/img/**','<%=orig_path%>/css/*.min.css',						
						'!<%=orig_path%>/{application,js,css,fonts,image,system}/**/*orig*',//不需要的orig文件		
						'!<%=orig_path%>/{application,js,css,fonts,image,system}/**/*not_used*/**',//不需要的not_used 目录 下的文件（文件可能是正常名字）	
						'!<%=orig_path%>/{application,js,css,fonts,image,system}/**/*not_used*',//不需要的not_used 目录和文件
						'!<%=orig_path%>/application/views/*.php',//排除需要htmlmin的php ，其他都copy

						],		
						dest:'dist/'
					},
					// {
						// expand: true,
						// flatten:false,
						// src:['orig/**/page/css/**','!orig/**/page/css/**/*orig*','!orig/**/page/application/**/*not_used*']
						// dest:''
					// },
					// {src:'',dest:''},
					// {src:'',dest:''},
					// {src:'',dest:''},
					],
			},
		},
		uglify:{
			main:{
				files:[
				{src:['<%=orig_path%>/js/common/*.js'],dest:'<%=dist_path%>/js/common/common.min.js'},
				{src:['<%=orig_path%>/js/component/header.js'],dest:'<%=dist_path%>/js/component/header.min.js'},
				{src:['<%=orig_path%>/js/edit_article/edit_article_func_*.js','<%=orig_path%>/js/edit_article/edit_article_main*.js'],dest:'<%=dist_path%>/js/edit_article/edit_article.min.js'},
				{src:['<%=orig_path%>/js/func/*.js'],dest:'<%=dist_path%>/js/func/func.min.js'},
				{src:['<%=orig_path%>/js/main/*.js'],dest:'<%=dist_path%>/js/main/main.min.js'},
				{src:['<%=orig_path%>/js/personal_info/*.js'],dest:'<%=dist_path%>/js/personal_info/personal_info.min.js'},
				{src:['<%=orig_path%>/js/read_article/*.js'],dest:'<%=dist_path%>/js/read_article/read_article.min.js'},
				{src:['<%=orig_path%>/js/search_result/*.js'],dest:'<%=dist_path%>/js/search_result/search_result.min.js'},
				{src:['<%=orig_path%>/js/sign_up/*.js'],dest:'<%=dist_path%>/js/sign_up/sign_up.min.js'},
				
				//{src:['<%=dist_path%>/js/js'],dest:'<%=dist_path%>/js/sign_up/sign_up.min.js'},
				],
			},
			others:{
				options:{
					orig_path:'page',
				},
				files:[
					{
						expand:true,
						cwd:'<%=orig_path%>/js/',
						src:['*.js',
							'!*.min.js',
							'!*orig*',//不需要的orig文件		
							'!*not_used*/**',//不需要的not_used 目录 下的文件（文件可能是正常名字）	
							'!*not_used*'],//不需要的not_used 目录和文件
							// '!<%=orig_path%>/js/jquery.validate.js',
							// '!<%=orig_path%>/js/jquery-1.11.1.js'],
						dest:'<%=dist_path%>/js/',
						ext:'.min.js',
					},
				],
			},
		},
		cssmin:{
			main:{
				files:[
					// {
						// expand:true,
						// cwd:'<%=dist_path%>/css',
					// },
					{src:['<%=orig_path%>/css/common/*.css', '!<%=orig_path%>/css/common/not_used*.css '],dest:'<%=dist_path%>/css/common/common.min.css'},
					{src:['<%=orig_path%>/css/ztree/zTreeStyle.css'],dest:'<%=dist_path%>/css/ztree/zTreeStyle.min.css'},
					{src:['<%=orig_path%>/css/bootstrap.css'],dest:'<%=dist_path%>/css/bootstrap.min.css'},
				]				
			},
			other:{
				
			}
		},
		htmlmin:{
			main:{
				  options: {                                 // Target options
					removeComments: true,
					collapseWhitespace: true,
					dist_path:'dist/page',
					//orig_path:'page'
				  },			
				files:[
					{
						expand:true,
						cwd:'<%=orig_path%>/application/views',
						src:['*.{php,html}','!not_used*'],
						dest:'<%=dist_path%>/application/views',
						ext:'.php',
					},
					{
						expand:true,
						cwd:'<%=orig_path%>/inc',
						src:['*.php','!not_used*'],
						dest:'<%=dist_path%>/inc',
						ext:'.inc.php',
					},					
					// {src:['common/*.css', '!common/not_used*.css '],dest:'common/common.min.css'},
					// {src:['ztree/zTreeStyle.css'],dest:'ztree/common.min.css'},
					// {src:['bootstrap.css'],dest:'bootstrap.min.css'},
				]
				
			}
		},		
	});
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');		
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	
	grunt.registerTask('default', ['clean','copy','uglify','cssmin','htmlmin']);
}
