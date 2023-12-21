<?php

/**
 * Plugin Name:       Latest Posts
 * Description:       A block showing the latest posts
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            Gustavo Hilario
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       latest-posts
 *
 * @package           blocks-course
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */

function blocks_course_latest_posts_block_render_callback($attributes)
{
	$args = array(
		'posts_per_page' => $attributes['numberOfPosts'],
		'post_status' => 'publish',
	);
	$recent_posts = get_posts($args);

	$posts = '<ul ' . get_block_wrapper_attributes() . '>';

	foreach ($recent_posts as $post) {
		$title = get_the_title($post);
		$title = $title ? $title : __('(No Title)', 'latest-posts');
		$permalink = get_permalink($post);
		$excerpt = get_the_excerpt($post);

		$posts .= '<li>';

		if ($attributes['displayFeaturedImage']) {
			$posts .= get_the_post_thumbnail($post, 'thumbnail');
		}

		$posts .= '<h5><a href="' . esc_url($permalink) . '">' . $title . '</a></h5>';
		$posts .= '<time datetime="' . esc_attr(get_the_date('c', $post)) . '">' . esc_html(get_the_date('', $post)) . '</time>';

		if (!empty($excerpt)) {
			$posts .= '<p>' . $excerpt . '</p>';
		}

		$posts .= '</li>';
	}
	$posts .= '</ul>';
	return $posts;
}
function blocks_course_latest_posts_block_init()
{
	register_block_type(__DIR__ . '/build', array(
		'render_callback' => 'blocks_course_latest_posts_block_render_callback',
	));
}
add_action('init', 'blocks_course_latest_posts_block_init');
