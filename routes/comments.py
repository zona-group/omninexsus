from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app import db
from models import Comment, CommentLike

comments = Blueprint('comments', __name__)


@comments.route('/<article_id>')
def get_comments(article_id):
    page = int(request.args.get('page', 1))
    per_page = 20

    root_comments = Comment.query.filter_by(
        article_id=article_id,
        parent_id=None,
        is_deleted=False
    ).order_by(Comment.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)

    def serialize(c):
        liked = False
        if current_user.is_authenticated:
            liked = CommentLike.query.filter_by(
                user_id=current_user.id, comment_id=c.id
            ).first() is not None
        return {
            'id': c.id,
            'content': c.content,
            'author': c.author.username,
            'avatar': c.author.avatar,
            'created_at': c.created_at.isoformat(),
            'like_count': c.like_count(),
            'liked': liked,
            'replies': [serialize(r) for r in c.replies.filter_by(is_deleted=False).all()]
        }

    return jsonify({
        'comments': [serialize(c) for c in root_comments.items],
        'total': root_comments.total,
        'pages': root_comments.pages,
        'current_page': page
    })


@comments.route('/add', methods=['POST'])
@login_required
def add_comment():
    data = request.get_json() or {}
    article_id = data.get('article_id')
    content = data.get('content', '').strip()
    parent_id = data.get('parent_id')

    if not article_id or not content:
        return jsonify({'success': False, 'error': 'article_id and content required'}), 400

    if len(content) > 2000:
        return jsonify({'success': False, 'error': 'Comment too long (max 2000 chars)'}), 400

    comment = Comment(
        article_id=article_id,
        user_id=current_user.id,
        content=content,
        parent_id=parent_id
    )
    db.session.add(comment)
    db.session.commit()

    return jsonify({
        'success': True,
        'comment': {
            'id': comment.id,
            'content': comment.content,
            'author': current_user.username,
            'avatar': current_user.avatar,
            'created_at': comment.created_at.isoformat(),
            'like_count': 0,
            'liked': False,
            'replies': []
        }
    })


@comments.route('/like/<int:comment_id>', methods=['POST'])
@login_required
def like_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    existing = CommentLike.query.filter_by(
        user_id=current_user.id, comment_id=comment_id
    ).first()

    if existing:
        db.session.delete(existing)
        db.session.commit()
        return jsonify({'success': True, 'liked': False, 'like_count': comment.like_count()})

    like = CommentLike(user_id=current_user.id, comment_id=comment_id)
    db.session.add(like)
    db.session.commit()
    return jsonify({'success': True, 'liked': True, 'like_count': comment.like_count()})


@comments.route('/delete/<int:comment_id>', methods=['DELETE'])
@login_required
def delete_comment(comment_id):
    comment = Comment.query.get_or_404(comment_id)
    if comment.user_id != current_user.id and not current_user.is_admin():
        return jsonify({'success': False, 'error': 'Unauthorized'}), 403

    comment.is_deleted = True
    comment.content = '[deleted]'
    db.session.commit()
    return jsonify({'success': True})
