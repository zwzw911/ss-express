module.exports = function(grunt){
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		orig_path:'./',
		dist_path:'dist',
		dist_tmp_path:'dist_tmp',
		should_uglify_folder:'bin,maintain,public,routes',
		should_copy_dir:'user_icon,public/fonts,public/image,public/javascripts/lib,routes/assist',
		// should_uglify_folder:'bin,public',
		//dist:'dist',
		clean:{
			main:{
				src:['dist','dist_tmp']
			},
			post:{
				src:['dist_tmp']
			},
			
		},
		htmlmin:{
			main:{
				  options: {                                 // Target options
					removeComments: true,
					collapseWhitespace: true,
					// dist_path:'dist/page',
					//orig_path:'page'
				  },			
				files:[
					{
						expand:true,
						// cwd:'<%=orig_path%>/application/views',
						src:['<%=orig_path%>/views/**/*.ejs'
						,'!<%=orig_path%>/views/not_used**'
						,'!<%=orig_path%>/views/**/not_used*'
						],
						dest:'<%=dist_path%>',
						// ext:'.php',
					}
				]
				
			}
		},
		cssmin:{
			main:{
				files:[
					{
						expand:true,
						// cwd:'<%=orig_path%>/application/views',
						src:['<%=orig_path%>/public/stylesheets/**/*.css'
						//,'!<%=orig_path%>/public/stylesheets/**/*.min.css'	//为了简化处理，对已经压缩过的css也再次压缩一下（否则之后还要在copy中特地指出）
						,'!<%=orig_path%>/public/stylesheets/not_used**'
						,'!<%=orig_path%>/public/stylesheets/**/not_used*'
						],
						dest:'<%=dist_path%>',
						// ext:'.php',
					}
				]				
			}
		},	
		ngAnnotate: {
			main:{
				options: {
					singleQuotes: true,
				},
				files: [
					{
						expand: true,
						src: ['<%=orig_path%>/public/javascripts/client/**/*.js'
						,'!<%=orig_path%>/public/javascripts/client/not_used**'
						,'!<%=orig_path%>/public/javascripts/client/**/not_used*'
						,'!<%=orig_path%>/public/javascripts/client/**/*.min.js'
						],
						dest:'<%=dist_tmp_path%>',
					},
				],
			},
		},
		copy:{
			main:{					
				files:[
					{
						expand: true,
						flatten:false,
						src:['<%=orig_path%>/{<%=should_copy_dir%>}/**'
						,'!<%=orig_path%>/{<%=should_copy_dir%>}/not_used**'
						,'!<%=orig_path%>/{<%=should_copy_dir%>}/**/not_used*'
						// ,
						],	
						dest:'<%=dist_path%>'
					}
					]
			}
		},
		uglify:{
			test:{
				files:[{
					expand:true,
					cwd:'<%=dist_tmp_path%>',
					src:['public/javascripts/client/**/*.js'],
					filter: 'isFile',
					dest:'<%=dist_path%>'
				}]
			},
			
			main:{
				files:[
					{
						expand:true,
						src:['<%=orig_path%>/{<%=should_uglify_folder%>}/**'
						,'<%=orig_path%>/app.js'	//app.js需要单独列出
						,'!<%=orig_path%>/{<%=should_uglify_folder%>}/not_used**'
						,'!<%=orig_path%>/{<%=should_uglify_folder%>}/**/not_used*'
						,'!<%=orig_path%>/views/**'
						,'!<%=orig_path%>/public/stylesheets/**'
						,'!<%=orig_path%>/public/javascripts/client/**'
						,'!<%=orig_path%>/public/javascripts/Test/**'
						,'!<%=orig_path%>/{user_icon,public/fonts,public/image,public/javascripts/lib}/**'
						,'!<%=orig_path%>/routes/assist/**'  //配置文件不需要缩小
						],
						filter: 'isFile',
						dest:'<%=dist_path%>'
					},
				],
			},
		}

				
	});
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');		
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');
	grunt.loadNpmTasks('grunt-ng-annotate');
	
	grunt.registerTask('default', ['clean:main','htmlmin','cssmin','ngAnnotate','uglify','copy:main','clean:post']);
}
